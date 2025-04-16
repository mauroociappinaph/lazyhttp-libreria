import {
  AuthConfig,
  UserCredentials,
  AuthInfo
} from '../http.types';

import {
  configureAuth as configureAuthHelper,
  login as loginHelper,
  logout as logoutHelper,
  isAuthenticated as isAuthenticatedHelper,
  getAuthenticatedUser as getAuthenticatedUserHelper,
  getAccessToken as getAccessTokenHelper,
  refreshToken as refreshTokenAuthHelper,
  handleRefreshTokenFailure as handleRefreshTokenFailureAuthHelper,
  decodeToken as decodeTokenHelper,
  isTokenExpired as isTokenExpiredHelper,
  storeToken as storeTokenHelper,
  getToken as getTokenHelper,
  removeToken as removeTokenHelper
} from '../http-auth';

import { metricsManager } from '../metrics/http-metrics-index';

/**
 * AuthManager - Responsable de manejar todas las operaciones de autenticación
 * Aplicando el principio de responsabilidad única (SRP) para separar la autenticación
 * de las operaciones HTTP generales.
 */
export class HttpAuthManager {
  /**
   * Configura el sistema de autenticación con las opciones proporcionadas
   */
  configureAuth(config: AuthConfig): void {
    configureAuthHelper(config);
  }

  /**
   * Inicia sesión con las credenciales proporcionadas
   */
  async login(credentials: UserCredentials): Promise<AuthInfo> {
    const response = await loginHelper(credentials);

    const authInfo: AuthInfo = {
      accessToken: response.access_token,
      isAuthenticated: true,
      refreshToken: response.refresh_token
    };

    // Iniciar seguimiento de métricas si la autenticación fue exitosa
    if (authInfo.isAuthenticated) {
      metricsManager.startTracking();
    }

    return authInfo;
  }

  /**
   * Cierra la sesión del usuario actual
   */
  async logout(): Promise<void> {
    // Finalizar sesión de métricas y enviar datos
    const metrics = await metricsManager.stopTracking();

    // Si hay métricas y debug está activado, mostrar resumen
    if (metrics) {
      console.log(`[HTTP] Sesión finalizada - Tiempo activo: ${Math.round(metrics.activeTime / 1000)}s, Peticiones: ${metrics.requestCount}`);
    }

    return logoutHelper();
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return isAuthenticatedHelper();
  }

  /**
   * Obtiene la información del usuario autenticado
   */
  async getAuthenticatedUser(): Promise<any | null> {
    return getAuthenticatedUserHelper();
  }

  /**
   * Obtiene el token de acceso actual
   */
  getAccessToken(): string | null {
    return getAccessTokenHelper();
  }

  /**
   * Refresca el token de autenticación
   */
  async refreshToken(): Promise<string> {
    return refreshTokenAuthHelper();
  }

  /**
   * Maneja el fallo al refrescar el token
   */
  async handleRefreshTokenFailure(): Promise<void> {
    return handleRefreshTokenFailureAuthHelper();
  }

  /**
   * Decodifica un token JWT
   */
  decodeToken(token: string): any {
    return decodeTokenHelper(token);
  }

  /**
   * Verifica si un token ha expirado
   */
  isTokenExpired(token: string | number): boolean {
    return isTokenExpiredHelper(token);
  }

  /**
   * Almacena un token en el almacenamiento
   */
  storeToken(key: string, value: string): void {
    storeTokenHelper(key, value);
  }

  /**
   * Obtiene un token del almacenamiento
   */
  getToken(key: string): string | null {
    return getTokenHelper(key);
  }

  /**
   * Elimina un token del almacenamiento
   */
  removeToken(key: string): void {
    removeTokenHelper(key);
  }
}
