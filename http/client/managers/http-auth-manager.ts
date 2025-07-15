
import { AuthConfig, UserCredentials, AuthInfo, AuthResponse, CookieOptions } from '../../types/auth.types';
import { API_URL } from '../../http-config';
import axios from 'axios';
import { CookieManager } from '../../cookie-manager';
import { metricsManager } from '../../metrics/http-metrics-index';

/**
 * AuthManager - Responsable de manejar todas las operaciones de autenticación
 * Aplicando el principio de responsabilidad única (SRP) para separar la autenticación
 * de las operaciones HTTP generales.
 */
export class HttpAuthManager {
  private DEFAULT_AUTH_CONFIG: AuthConfig = {
    baseURL: '',
    loginEndpoint: '/auth/login',
    logoutEndpoint: '/auth/logout',
    userInfoEndpoint: '/auth/me',
    refreshEndpoint: '/auth/refresh',
    tokenKey: 'token',
    refreshTokenKey: 'refreshToken',
    storage: 'localStorage'
  };

  private authState: AuthInfo = {
    accessToken: '',
    isAuthenticated: false
  };

  private currentAuthConfig: AuthConfig = {
    baseURL: '',
    loginEndpoint: '/login',
    logoutEndpoint: '/logout',
    tokenKey: 'token',
    refreshTokenKey: 'refreshToken',
    storage: 'localStorage'
  };

  constructor() {
    this.currentAuthConfig = { ...this.DEFAULT_AUTH_CONFIG };
  }

  /**
   * Configura el sistema de autenticación con las opciones proporcionadas
   * @param config Configuración personalizada
   */
  configureAuth(config: Partial<AuthConfig>): void {
    this.currentAuthConfig = {
      ...this.currentAuthConfig,
      ...config
    };

    // Inicializar estado con tokens almacenados
    const accessToken = this.getToken(this.currentAuthConfig.tokenKey);
    if (accessToken) {
      const tokenData = this.decodeToken(accessToken);
      const expiresAt = tokenData?.exp ? tokenData.exp * 1000 : undefined;

      // Solo consideramos válido si no está expirado
      if (!expiresAt || expiresAt > Date.now()) {
        const refreshTokenKey = this.currentAuthConfig.refreshTokenKey || '';
        const refreshToken = this.getToken(refreshTokenKey);

        this.authState = {
          accessToken,
          refreshToken: refreshToken || undefined,
          expiresAt,
          isAuthenticated: true
        };
      } else {
        // Limpiar tokens expirados
        this.removeToken(this.currentAuthConfig.tokenKey);
        if (this.currentAuthConfig.refreshTokenKey) {
          this.removeToken(this.currentAuthConfig.refreshTokenKey);
        }
      }
    }
  }

  /**
   * Inicia sesión con las credenciales proporcionadas
   * @param credentials Credenciales del usuario
   * @returns Información de autenticación
   */
  async login(credentials: UserCredentials): Promise<AuthInfo> {
    try {
      const response = await fetch(`${this.currentAuthConfig.baseURL}${this.currentAuthConfig.loginEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data: AuthResponse = await response.json();
      this.storeToken(this.currentAuthConfig.tokenKey, data.access_token);
      if (this.currentAuthConfig.refreshTokenKey) {
        this.storeToken(this.currentAuthConfig.refreshTokenKey, data.refresh_token as string);
      }

      // Validar token recibido
      const tokenData = this.decodeToken(data.access_token);
      if (!tokenData || this.isTokenExpired(data.access_token)) {
        this.removeToken(this.currentAuthConfig.tokenKey);
        if (this.currentAuthConfig.refreshTokenKey) {
          this.removeToken(this.currentAuthConfig.refreshTokenKey);
        }
        throw new Error('Token inválido o expirado');
      }

      if (this.currentAuthConfig.onLogin) {
        this.currentAuthConfig.onLogin(data);
      }

      const authInfo: AuthInfo = {
        accessToken: data.access_token,
        isAuthenticated: true,
        refreshToken: data.refresh_token
      };

      // Iniciar seguimiento de métricas si la autenticación fue exitosa
      if (authInfo.isAuthenticated) {
        metricsManager.startTracking();
      }

      return authInfo;
    } catch (error) {
      if (this.currentAuthConfig.onError) {
        this.currentAuthConfig.onError(error);
      }
      throw error;
    }
  }

  /**
   * Cierra la sesión actual
   */
  async logout(): Promise<void> {
    try {
      const token = this.getToken(this.currentAuthConfig.tokenKey);
      if (token) {
        await fetch(`${this.currentAuthConfig.baseURL}${this.currentAuthConfig.logoutEndpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      if (this.currentAuthConfig.onError) {
        this.currentAuthConfig.onError(error);
      }
    } finally {
      this.removeToken(this.currentAuthConfig.tokenKey);
      if (this.currentAuthConfig.onLogout) {
        this.currentAuthConfig.onLogout();
      }
      // Finalizar sesión de métricas y enviar datos
      const metrics = await metricsManager.stopTracking();

      // Si hay métricas y debug está activado, mostrar resumen
      if (metrics) {
        console.log(`[HTTP] Sesión finalizada - Tiempo activo: ${Math.round(metrics.activeTime / 1000)}s, Peticiones: ${metrics.requestCount}`);
      }
    }
  }

  /**
   * Verifica si el usuario está autenticado
   * @returns `true` si está autenticado, `false` en caso contrario
   */
  isAuthenticated(): boolean {
    return !!this.getToken(this.currentAuthConfig.tokenKey);
  }

  /**
   * Obtiene la información del usuario autenticado
   * @returns Información del usuario o `null` si no está autenticado
   */
  async getAuthenticatedUser(): Promise<any | null> {
    if (!this.isAuthenticated()) {
      return null;
    }

    // Si ya tenemos la información del usuario, devolverla
    if (this.authState.user) {
      return this.authState.user;
    }

    // Si no, intentar cargarla
    if (this.currentAuthConfig.userInfoEndpoint) {
      try {
        const response = await axios.get(`${API_URL}${this.currentAuthConfig.userInfoEndpoint}`, {
          headers: {
            Authorization: `Bearer ${this.authState.accessToken}`
          }
        });
        this.authState.user = response.data;
        return this.authState.user;
      } catch (error) {
        console.warn('No se pudo cargar la información del usuario');
        return null;
      }
    }

    return null;
  }

  /**
   * Obtiene el token de acceso actual
   * @returns Token de acceso o `null` si no está autenticado
   */
  getAccessToken(): string | null {
    if (!this.isAuthenticated()) {
      return null;
    }
    return this.authState.accessToken;
  }

  /**
   * Refresca el token de autenticación
   * @returns El nuevo token de autenticación
   */
  async refreshToken(): Promise<string> {
    if (!this.currentAuthConfig.refreshEndpoint || !this.authState.refreshToken) {
      throw new Error('No hay configuración para refrescar token');
    }

    try {
      const endpoint = `${API_URL}${this.currentAuthConfig.refreshEndpoint}`;
      const response = await axios.post<AuthResponse>(endpoint, {
        refresh_token: this.authState.refreshToken
      });

      if (!response.data.access_token) {
        throw new Error('No se recibió un token de acceso');
      }

      // Extraer datos de la respuesta
      const { access_token, refresh_token, expires_in } = response.data;

      // Calcular tiempo de expiración
      const expiresAt = expires_in
        ? Date.now() + (expires_in * 1000)
        : undefined;

      // Almacenar tokens
      this.storeToken(this.currentAuthConfig.tokenKey, access_token);
      if (refresh_token && this.currentAuthConfig.refreshTokenKey) {
        this.storeToken(this.currentAuthConfig.refreshTokenKey, refresh_token);
      }

      // Actualizar estado
      this.authState = {
        ...this.authState,
        accessToken: access_token,
        refreshToken: refresh_token || this.authState.refreshToken,
        expiresAt,
        isAuthenticated: true
      };

      return access_token;
    } catch (error) {
      // Manejar error de refresco
      if (this.currentAuthConfig.onError) {
        this.currentAuthConfig.onError(error);
      }
      throw error;
    }
  }

  /**
   * Maneja el fallo al refrescar el token
   */
  async handleRefreshTokenFailure(): Promise<void> {
    // Limpiar tokens almacenados
    this.removeToken(this.currentAuthConfig.tokenKey);
    if (this.currentAuthConfig.refreshTokenKey) {
      this.removeToken(this.currentAuthConfig.refreshTokenKey);
    }

    // Resetear estado
    this.authState = {
      accessToken: '',
      isAuthenticated: false
    };

    // Notificar error de autenticación
    if (this.currentAuthConfig.onError) {
      this.currentAuthConfig.onError(new Error('Falló el refresco del token'));
    }
  }

  /**
   * Decodifica un token JWT
   * @param token Token JWT
   * @returns Payload del token decodificado
   */
  decodeToken(token: string): any {
    try {
      // Dividir el token en sus partes
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      // Decodificar la parte del payload (segunda parte)
      const payload = parts[1];
      const decodedStr = atob(payload);
      const decoded = JSON.parse(decodedStr);
      if (typeof decoded !== 'object' || decoded === null) {
        return null;
      }
      return decoded;
    } catch (error) {
      console.warn('Error al decodificar token', error);
      return null;
    }
  }

  /**
   * Verifica si un token está expirado
   * @param token Token a verificar o timestamp de expiración
   * @returns `true` si está expirado, `false` en caso contrario
   */
  isTokenExpired(token: string | number): boolean {
    if (typeof token === 'number') {
      return token < Date.now();
    }

    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return false;
    }

    const expiresAt = decoded.exp * 1000; // Convertir a milisegundos
    return expiresAt < Date.now();
  }

  /**
   * Almacena un token en el almacenamiento configurado
   * @param key Clave del token
   * @param value Valor del token
   */
  storeToken(key: string, value: string): void {
    const cookieOptions: CookieOptions = {
      ...this.currentAuthConfig.cookieOptions,
      path: '/'
    };

    switch (this.currentAuthConfig.storage) {
      case 'cookie':
        CookieManager.set(key, value, cookieOptions);
        break;
      case 'localStorage':
        localStorage.setItem(key, value);
        break;
      case 'sessionStorage':
        sessionStorage.setItem(key, value);
        break;
    }
  }

  /**
   * Obtiene un token del almacenamiento configurado
   * @param key Clave del token
   * @returns Valor del token o null si no existe
   */
  getToken(key: string): string | null {
    switch (this.currentAuthConfig.storage) {
      case 'cookie':
        return CookieManager.get(key);
      case 'localStorage':
        return localStorage.getItem(key);
      case 'sessionStorage':
        return sessionStorage.getItem(key);
      default:
        return null;
    }
  }

  /**
   * Elimina un token del almacenamiento configurado
   * @param key Clave del token
   */
  removeToken(key: string): void {
    switch (this.currentAuthConfig.storage) {
      case 'cookie':
        CookieManager.remove(key, this.currentAuthConfig.cookieOptions);
        break;
      case 'localStorage':
        localStorage.removeItem(key);
        break;
      case 'sessionStorage':
        sessionStorage.removeItem(key);
        break;
    }
  }
}