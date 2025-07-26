/**
 * Servicio de autenticación centralizado
 * Elimina la duplicación de métodos de auth entre BrowserHttpClient y HttpClient
 */

import { AuthConfig, AuthInfo, UserCredentials } from '../types/core.types';

export interface IAuthService {
  configureAuth(config: AuthConfig): void;
  login(credentials: UserCredentials): Promise<AuthInfo>;
  logout(): Promise<void>;
  isAuthenticated(): boolean;
  getAuthenticatedUser(): Promise<AuthInfo | null>;
  getAccessToken(): string | null;
  refreshToken(): Promise<string>;
  handleRefreshTokenFailure(): Promise<void>;
}

/**
 * Implementación del servicio de autenticación
 * Centraliza toda la lógica de autenticación para evitar duplicación
 */
export class AuthService implements IAuthService {
  private authManager: any; // Será inyectado según el contexto

  constructor(authManager: any) {
    this.authManager = authManager;
  }

  /**
   * Configura la autenticación
   */
  configureAuth(config: AuthConfig): void {
    return this.authManager.configureAuth(config);
  }

  /**
   * Inicia sesión con las credenciales proporcionadas
   */
  async login(credentials: UserCredentials): Promise<AuthInfo> {
    return this.authManager.login(credentials);
  }

  /**
   * Cierra la sesión eliminando tokens
   */
  async logout(): Promise<void> {
    return this.authManager.logout();
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.authManager.isAuthenticated();
  }

  /**
   * Obtiene el usuario autenticado
   */
  async getAuthenticatedUser(): Promise<AuthInfo | null> {
    return this.authManager.getAuthenticatedUser();
  }

  /**
   * Obtiene el token de acceso
   */
  getAccessToken(): string | null {
    return this.authManager.getAccessToken();
  }

  /**
   * Refresca el token de acceso
   */
  async refreshToken(): Promise<string> {
    return this.authManager.refreshToken();
  }

  /**
   * Maneja el fallo de refresh token
   */
  async handleRefreshTokenFailure(): Promise<void> {
    return this.authManager.handleRefreshTokenFailure();
  }
}
