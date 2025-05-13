import { HttpAuthManager } from '../../../../http/client/managers/http-auth-manager';
import * as authHelpers from '../../../../http/http-auth';

// Mock de las funciones de http-auth
jest.mock('../../../../http/http-auth', () => ({
  configureAuth: jest.fn(),
  login: jest.fn(),
  logout: jest.fn().mockResolvedValue(undefined),
  isAuthenticated: jest.fn(),
  getAuthenticatedUser: jest.fn(),
  getAccessToken: jest.fn(),
  refreshToken: jest.fn(),
  handleRefreshTokenFailure: jest.fn(),
  decodeToken: jest.fn(),
  isTokenExpired: jest.fn(),
  storeToken: jest.fn(),
  getToken: jest.fn(),
  removeToken: jest.fn()
}));

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

describe('HttpAuthManager', () => {
  let authManager: HttpAuthManager;

  beforeEach(() => {
    jest.clearAllMocks();
    authManager = new HttpAuthManager();
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
    expect(authHelpers.configureAuth).toHaveBeenCalledWith(config);
  });

  test('debería manejar login correctamente', async () => {
    // Arrange
    const credentials = { username: 'user', password: 'pass' };
    const authResponse = {
      access_token: 'access-token-123',
      refresh_token: 'refresh-token-456'
    };

    (authHelpers.login as jest.Mock).mockResolvedValue(authResponse);
    (authHelpers.isAuthenticated as jest.Mock).mockReturnValue(true);

    // Act
    const result = await authManager.login(credentials);

    // Assert
    expect(authHelpers.login).toHaveBeenCalledWith(credentials);
    expect(result).toEqual({
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-456',
      isAuthenticated: true
    });
  });

  test('debería manejar logout correctamente', async () => {
    // Act
    await authManager.logout();

    // Assert
    expect(authHelpers.logout).toHaveBeenCalled();
  });

  test('debería verificar si está autenticado', () => {
    // Arrange
    (authHelpers.isAuthenticated as jest.Mock).mockReturnValue(true);

    // Act & Assert
    expect(authManager.isAuthenticated()).toBe(true);

    (authHelpers.isAuthenticated as jest.Mock).mockReturnValue(false);
    expect(authManager.isAuthenticated()).toBe(false);
  });

  test('debería obtener usuario autenticado', async () => {
    // Arrange
    const user = { id: 1, name: 'Test User' };
    (authHelpers.getAuthenticatedUser as jest.Mock).mockResolvedValue(user);

    // Act
    const result = await authManager.getAuthenticatedUser();

    // Assert
    expect(result).toEqual(user);
  });

  test('debería obtener token de acceso', () => {
    // Arrange
    (authHelpers.getAccessToken as jest.Mock).mockReturnValue('access-token-123');

    // Act
    const result = authManager.getAccessToken();

    // Assert
    expect(result).toBe('access-token-123');
  });

  test('debería manejar el refresco de token', async () => {
    // Arrange
    (authHelpers.refreshToken as jest.Mock).mockResolvedValue('new-token-123');

    // Act
    const result = await authManager.refreshToken();

    // Assert
    expect(result).toBe('new-token-123');
  });

  test('debería almacenar y recuperar tokens', () => {
    // Arrange
    const key = 'test-key';
    const value = 'test-value';
    (authHelpers.getToken as jest.Mock).mockReturnValue(value);

    // Act
    authManager.storeToken(key, value);
    const result = authManager.getToken(key);

    // Assert
    expect(authHelpers.storeToken).toHaveBeenCalledWith(key, value);
    expect(result).toBe(value);
  });

  test('debería eliminar tokens', () => {
    // Arrange
    const key = 'test-key';

    // Act
    authManager.removeToken(key);

    // Assert
    expect(authHelpers.removeToken).toHaveBeenCalledWith(key);
  });

  test('debería decodificar tokens', () => {
    // Arrange
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
    const decoded = { sub: '1234567890' };
    (authHelpers.decodeToken as jest.Mock).mockReturnValue(decoded);

    // Act
    const result = authManager.decodeToken(token);

    // Assert
    expect(result).toEqual(decoded);
  });

  test('debería verificar si un token ha expirado', () => {
    // Arrange
    const token = 'test-token';
    (authHelpers.isTokenExpired as jest.Mock).mockReturnValue(true);

    // Act
    const result = authManager.isTokenExpired(token);

    // Assert
    expect(result).toBe(true);
  });
});
