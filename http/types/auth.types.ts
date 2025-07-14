/**
 * Tipos de autenticación soportados
 */
export type AuthType = 'jwt' | 'oauth2' | 'basic' | 'session';

/**
 * Opciones para la configuración de cookies
 */
export interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

/**
 * Tipo de almacenamiento para los tokens de autenticación
 */
export type StorageType = 'cookie' | 'localStorage' | 'sessionStorage';

/**
 * Configuración de autenticación
 */
export interface AuthConfig {
  baseURL: string;
  loginEndpoint: string;
  logoutEndpoint: string;
  userInfoEndpoint?: string;
  refreshEndpoint?: string;
  tokenKey: string;
  refreshTokenKey: string;
  storage: StorageType;
  cookieOptions?: CookieOptions;
  onLogin?: (response: AuthResponse) => void;
  onLogout?: () => void;
  /**
   * Callback executed when an error occurs during authentication
   */
  onError?: (error: unknown) => void;
}

/**
 * Credenciales de usuario para login
 */
export interface UserCredentials {
  username: string;
  password: string;
  [key: string]: unknown; // Campos adicionales
}

/**
 * Información de autenticación
 */
export interface AuthInfo {
  /**
   * Token de acceso
   */
  accessToken: string;

  /**
   * Token de refresco
   */
  refreshToken?: string;

  /**
   * Tiempo de expiración (timestamp en milisegundos)
   */
  expiresAt?: number;

  /**
   * Información del usuario autenticado
   */
  user?: any;

  /**
   * Indica si está autenticado
   */
  isAuthenticated: boolean;
}

/**
 * Respuesta de autenticación
 */
export interface AuthResponse {
  /**
   * Token de acceso
   */
  access_token: string;

  /**
   * Token de refresco
   */
  refresh_token?: string;

  /**
   * Tipo de token
   */
  token_type?: string;

  /**
   * Tiempo de expiración en segundos
   */
  expires_in?: number;
}
