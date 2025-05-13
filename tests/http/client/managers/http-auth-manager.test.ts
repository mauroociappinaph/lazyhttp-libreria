import { HttpAuthManager } from '../../../../http/client/managers/http-auth-manager';

describe('HttpAuthManager', () => {
  let authManager: HttpAuthManager;

  beforeEach(() => {
    authManager = new HttpAuthManager();
  });

  test('debería configurar y usar tokens de autenticación', () => {
    // Arrange
    const token = 'test-token-123';

    // Act
    authManager.storeToken('access_token', token);
    const retrievedToken = authManager.getToken('access_token');

    // Assert
    expect(retrievedToken).toBe(token);
    expect(authManager.isAuthenticated()).toBe(true);
  });

  test('debería manejar correctamente el logout', () => {
    // Arrange
    authManager.storeToken('access_token', 'test-token');
    expect(authManager.isAuthenticated()).toBe(true);

    // Act
    authManager.logout();

    // Assert
    expect(authManager.getToken('access_token')).toBeNull();
    expect(authManager.isAuthenticated()).toBe(false);
  });

  test('debería configurar credenciales de usuario', () => {
    // Arrange
    const user = { id: '123', name: 'Test User' };

    // Act
    authManager.storeToken('user', JSON.stringify(user));
    const userToken = authManager.getToken('user');
    const retrievedUser = userToken ? JSON.parse(userToken) : null;

    // Assert
    expect(retrievedUser).toEqual(user);
  });

  test('debería manejar refresh tokens', () => {
    // Arrange
    const refreshToken = 'refresh-token-123';

    // Act
    authManager.storeToken('refresh_token', refreshToken);
    const retrievedRefreshToken = authManager.getToken('refresh_token');

    // Assert
    expect(retrievedRefreshToken).toBe(refreshToken);
  });

  test('debería manejar tokens nulos o vacíos correctamente', () => {
    // Act & Assert
    expect(authManager.isAuthenticated()).toBe(false);

    authManager.storeToken('access_token', '');
    expect(authManager.isAuthenticated()).toBe(false);

    authManager.removeToken('access_token');
    expect(authManager.isAuthenticated()).toBe(false);
  });

  test('debería limpiar toda la información de autenticación al hacer logout', () => {
    // Arrange
    authManager.storeToken('access_token', 'test-token');
    authManager.storeToken('refresh_token', 'refresh-token');
    authManager.storeToken('user', JSON.stringify({ id: '123', name: 'Test User' }));

    // Act
    authManager.logout();

    // Assert
    expect(authManager.getToken('access_token')).toBeNull();
    expect(authManager.getToken('refresh_token')).toBeNull();
    expect(authManager.getToken('user')).toBeNull();
    expect(authManager.isAuthenticated()).toBe(false);
  });
});
