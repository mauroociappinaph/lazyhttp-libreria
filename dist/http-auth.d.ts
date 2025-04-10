import { AuthConfig, AuthInfo, UserCredentials } from './http.types';
/**
 * Configuración por defecto de autenticación
 */
export declare const DEFAULT_AUTH_CONFIG: AuthConfig;
/**
 * Estado actual de autenticación
 */
export declare let authState: AuthInfo;
/**
 * Configuración actual de autenticación
 */
export declare let currentAuthConfig: AuthConfig;
/**
 * Configura el sistema de autenticación
 * @param config Configuración personalizada
 */
export declare function configureAuth(config: Partial<AuthConfig>): void;
/**
 * Inicia sesión con las credenciales proporcionadas
 * @param credentials Credenciales del usuario
 * @returns Información de autenticación
 */
export declare function login(credentials: UserCredentials): Promise<AuthInfo>;
/**
 * Cierra la sesión actual
 */
export declare function logout(): Promise<void>;
/**
 * Verifica si el usuario está autenticado
 * @returns `true` si está autenticado, `false` en caso contrario
 */
export declare function isAuthenticated(): boolean;
/**
 * Obtiene la información del usuario autenticado
 * @returns Información del usuario o `null` si no está autenticado
 */
export declare function getAuthenticatedUser(): Promise<any | null>;
/**
 * Obtiene el token de acceso actual
 * @returns Token de acceso o `null` si no está autenticado
 */
export declare function getAccessToken(): string | null;
/**
 * Refresca el token de autenticación
 * @returns El nuevo token de autenticación
 */
export declare function refreshToken(): Promise<string>;
/**
 * Maneja el fallo al refrescar el token
 */
export declare function handleRefreshTokenFailure(): Promise<void>;
/**
 * Decodifica un token JWT
 * @param token Token JWT
 * @returns Payload del token decodificado
 */
export declare function decodeToken(token: string): any;
/**
 * Verifica si un token está expirado
 * @param token Token a verificar o timestamp de expiración
 * @returns `true` si está expirado, `false` en caso contrario
 */
export declare function isTokenExpired(token: string | number): boolean;
/**
 * Almacena un token en el almacenamiento configurado
 * @param key Clave del token
 * @param value Valor del token
 */
export declare function storeToken(key: string, value: string): void;
/**
 * Obtiene un token del almacenamiento configurado
 * @param key Clave del token
 * @returns Token almacenado o `null` si no existe
 */
export declare function getToken(key: string): string | null;
/**
 * Elimina un token del almacenamiento configurado
 * @param key Clave del token
 */
export declare function removeToken(key: string): void;
