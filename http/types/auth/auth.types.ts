/**
 * Tipos de autenticación soportados
 */
export type AuthType = "jwt" | "oauth2" | "basic" | "session";

/**
 * Opciones de almacenamiento de cookies
 */
export interface CookieOptions {
  /**
   * Tiempo máximo de vida en segundos
   */
  maxAge?: number;

  /**
   * Fecha de expiración
   */
  expires?: Date;

  /**
   * Dominio de la cookie
   */
  domain?: string;

  /**
   * Ruta de la cookie
   */
  path?: string;

  /**
   * Si la cookie solo debe enviarse en conexiones HTTPS
   */
  secure?: boolean;

  /**
   * Si la cookie es accesible solo desde el servidor
   */
  httpOnly?: boolean;

  /**
   * Política de mismo sitio
   */
  sameSite?: "Strict" | "Lax" | "None";
}

/**
 * Tipos de almacenamiento para tokens
 */
export type StorageType = "cookie" | "localStorage" | "sessionStorage";

/**
 * Configuración para el sistema de autenticación
 */
export interface AuthConfig {
  /**
   * URL base para endpoints de autenticación
   */
  baseURL: string;

  /**
   * Endpoint para iniciar sesión
   */
  loginEndpoint: string;

  /**
   * Endpoint para cerrar sesión
   */
  logoutEndpoint: string;

  /**
   * Endpoint para obtener información de usuario
   */
  userInfoEndpoint?: string;

  /**
   * Endpoint para refrescar el token
   */
  refreshEndpoint?: string;

  /**
   * Clave para el token de acceso
   */
  tokenKey: string;

  /**
   * Clave para el token de refresco
   */
  refreshTokenKey: string;

  /**
   * Tipo de almacenamiento para los tokens
   */
  storage: StorageType;

  /**
   * Opciones para cookies (si storage es 'cookie')
   */
  cookieOptions?: CookieOptions;

  /**
   * Callback al iniciar sesión
   */
  onLogin?: (response: AuthResponse) => void;

  /**
   * Callback al cerrar sesión
   */
  onLogout?: () => void;

  /**
   * Callback al ocurrir un error
   */
  onError?: (error: any) => void;
}

/**
 * Credenciales de usuario
 */
export interface UserCredentials {
  /**
   * Nombre de usuario
   */
  username: string;

  /**
   * Contraseña
   */
  password: string;

  /**
   * Campos adicionales
   */
  [key: string]: any;
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
 * Respuesta del servidor de autenticación
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
