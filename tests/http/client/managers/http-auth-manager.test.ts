import { HttpAuthManager } from '../../../../http/client/managers/http-auth-manager';
import { metricsManager } from '../../../../http/metrics/http-metrics-index';
import axios from 'axios';

// Mock global localStorage para Node.js

declare global {
  // eslint-disable-next-line no-var
  var localStorage: Storage;
}

global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};

// Mock del metricsManager
jest.mock('../../../../http/metrics/http-metrics-index', () => ({
  metricsManager: {
    startTracking: jest.fn(),
    stopTracking: jest.fn().mockResolvedValue({
      activeTime: 5000,
      requestCount: 10
    })
  }
}));

// Mock de axios para todos los tests
jest.mock('axios');

describe('HttpAuthManager', () => {
  let authManager: HttpAuthManager;

  beforeEach(() => {
    jest.clearAllMocks();
    authManager = new HttpAuthManager();
    // Eliminar redefinición de currentAuthConfig para permitir asignación real
  });

  test('debería configurar correctamente la autenticación', () => {
    // Arrange
    const config = {
      baseURL: 'https://api.example.com',
      tokenKey: 'access_token',
      loginEndpoint: '/auth/login',
      logoutEndpoint: '/auth/logout',
      refreshTokenKey: 'refresh_token',
      storage: 'localStorage' as const
    };

    // Act
    authManager.configureAuth(config);

    // Assert
    // Solo verificamos que configureAuth actualizó la config, sin asignar directamente
    expect(authManager['currentAuthConfig']).toEqual(expect.objectContaining(config));
  });

  test('debería manejar login correctamente', async () => {
    // Arrange
    const credentials = { username: 'user', password: 'pass' };
    const authResponse = {
      access_token: 'access-token-123',
      refresh_token: 'refresh-token-456',
      expires_in: 3600
    };

    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(authResponse),
    } as Response);

    jest.spyOn(authManager, 'decodeToken').mockReturnValue({ exp: Date.now() / 1000 + 3600 });
    jest.spyOn(authManager, 'storeToken');
    jest.spyOn(authManager, 'isTokenExpired').mockReturnValue(false);

    // Act
    const result = await authManager.login(credentials);

    // Assert
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({ method: 'POST' })
    );
    expect(authManager.storeToken).toHaveBeenCalledWith('token', 'access-token-123');
    expect(authManager.storeToken).toHaveBeenCalledWith('refreshToken', 'refresh-token-456');
    expect(result).toEqual({
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-456',
      isAuthenticated: true
    });
    expect(metricsManager.startTracking).toHaveBeenCalled();
  });

  test('debería manejar logout correctamente', async () => {
    // Arrange
    jest.spyOn(authManager, 'getToken').mockReturnValue('some-token');
    jest.spyOn(authManager, 'removeToken');
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({ ok: true } as Response);

    // Act
    await authManager.logout();

    // Assert
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/logout'),
      expect.objectContaining({ method: 'POST' })
    );
    expect(authManager.removeToken).toHaveBeenCalledWith('token');
    expect(metricsManager.stopTracking).toHaveBeenCalled();
  });

  test('debería verificar si está autenticado', () => {
    // Arrange
    jest.spyOn(authManager, 'getToken').mockReturnValue('some-token');
    expect(authManager.isAuthenticated()).toBe(true);

    jest.spyOn(authManager, 'getToken').mockReturnValue(null);
    expect(authManager.isAuthenticated()).toBe(false);
  });

  test('debería obtener usuario autenticado', async () => {
    // Arrange
    const user = { id: 1, name: 'Test User' };
    jest.spyOn(authManager, 'isAuthenticated').mockReturnValue(true);
    jest.spyOn(authManager, 'getAccessToken').mockReturnValue('access-token-123');
    // Mock del estado interno con propiedad user
    authManager['authState'] = { user, accessToken: 'access-token-123', refreshToken: 'refresh-token-456', isAuthenticated: true };
    // Mock de fetch para simular respuesta de usuario
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(user) } as Response);

    // Act
    const result = await authManager.getAuthenticatedUser();

    // Assert
    expect(result).toEqual(user);
  });

  test('debería obtener token de acceso', () => {
    // Arrange
    jest.spyOn(authManager, 'isAuthenticated').mockReturnValue(true);
    authManager['authState'].accessToken = 'access-token-123';

    // Act
    const result = authManager.getAccessToken();

    // Assert
    expect(result).toBe('access-token-123');
  });

  test('debería manejar el refresco de token', async () => {
    // Arrange
    const newAccessToken = 'new-access-token-123';
    const newRefreshToken = 'new-refresh-token-456';
    authManager['authState'] = { refreshToken: 'old-refresh-token', accessToken: '', user: undefined, isAuthenticated: false };
    // Mock de axios.post para simular respuesta
    (axios.post as jest.Mock).mockResolvedValue({
      data: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expires_in: 3600
      }
    });
    jest.spyOn(authManager, 'storeToken');

    // Act
    const result = await authManager.refreshToken();

    // Assert
    expect(result).toBe(newAccessToken);
    expect(authManager.storeToken).toHaveBeenCalledWith('token', newAccessToken);
    expect(authManager.storeToken).toHaveBeenCalledWith('refreshToken', newRefreshToken);
  });

  test('debería almacenar y recuperar tokens', () => {
    // Arrange
    const key = 'test-key';
    const value = 'test-value';
    jest.spyOn(localStorage, 'setItem');
    jest.spyOn(localStorage, 'getItem').mockReturnValue(value);

    // Act
    authManager.storeToken(key, value);
    const result = authManager.getToken(key);

    // Assert
    expect(localStorage.setItem).toHaveBeenCalledWith(key, value);
    expect(result).toBe(value);
  });

  test('debería eliminar tokens', () => {
    // Arrange
    const key = 'test-key';
    jest.spyOn(localStorage, 'removeItem');

    // Act
    authManager.removeToken(key);

    // Assert
    expect(localStorage.removeItem).toHaveBeenCalledWith(key);
  });

  test('debería decodificar tokens', () => {
    // Arrange
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
    // Act
    const result = authManager.decodeToken(token);

    // Assert
    expect(result).toEqual({ sub: '1234567890' });
  });

  test('debería verificar si un token ha expirado', () => {
    // Arrange
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NzIyNDY0MDB9.invalid'; // Expired in 2023
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjI1MjQ2MDgwMDB9.valid'; // Expires in 2050

    // Act & Assert
    expect(authManager.isTokenExpired(expiredToken)).toBe(true);
    expect(authManager.isTokenExpired(validToken)).toBe(false);
  });
});
