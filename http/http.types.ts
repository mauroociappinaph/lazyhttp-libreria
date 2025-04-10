import { AxiosResponse } from 'axios';
/**
 * Tipos para el cliente HTTP
 */

/**
 * Métodos HTTP soportados
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Opciones para las peticiones HTTP
 */
export interface RequestOptions {
  /**
   * Método HTTP a utilizar
   * @default 'GET'
   */
  method?: HttpMethod;

  /**
   * Cabeceras HTTP personalizadas
   */
  headers?: Record<string, string>;

  /**
   * Cuerpo de la petición (se serializará a JSON)
   */
  body?: unknown;

  /**
   * Indica si la petición debe incluir el token de autenticación
   * @default false
   */
  withAuth?: boolean;

  /**
   * Tiempo máximo de espera en milisegundos
   * @default 10000 (10 segundos)
   */
  timeout?: number;

  /**
   * Número de reintentos en caso de error
   * @default 0
   */
  retries?: number;

  /**
   * Parámetros de la petición
   */
  params?: Record<string, string | number>;
}

/**
 * Respuesta genérica de la API
 */
export interface ApiResponse<T> {
  /**
   * Datos de la respuesta
   */
  data: T | null;

  /**
   * Mensaje de error (si lo hay)
   */
  error: string | null;

  /**
   * Código de estado HTTP
   */
  status: number;

  /**
   * Metadatos adicionales de la respuesta
   */
  meta?: Record<string, any>;
}

/**
 * Cliente HTTP - Interfaz pública
 * Expone únicamente los métodos que deben ser accesibles para los consumidores
 */
export interface HttpClient {
  /**
   * Realiza una petición HTTP genérica
   */
  request<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>>;

  /**
   * Realiza una petición GET
   */
  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;

  /**
   * Realiza una petición GET para obtener todos los elementos de una colección
   */
  getAll<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;

  /**
   * Realiza una petición GET para obtener un elemento por su ID
   */
  getById<T>(endpoint: string, id: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;

  /**
   * Realiza una petición POST
   */
  post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;

  /**
   * Realiza una petición PUT
   */
  put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;

  /**
   * Realiza una petición PATCH
   */
  patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;

  /**
   * Realiza una petición DELETE
   */
  delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>>;

  /**
   * Inicializa el cliente HTTP
   */
  initialize(): Promise<void>;

  /**
   * Configura el sistema de autenticación
   * @param config Configuración de autenticación
   */
  configureAuth(config: AuthConfig): void;

  /**
   * Inicia sesión con las credenciales proporcionadas
   * @param credentials Credenciales del usuario
   * @returns Información de autenticación
   */
  login(credentials: UserCredentials): Promise<AuthInfo>;

  /**
   * Cierra la sesión actual
   */
  logout(): Promise<void>;

  /**
   * Verifica si el usuario está autenticado
   * @returns `true` si está autenticado, `false` en caso contrario
   */
  isAuthenticated(): boolean;

  /**
   * Obtiene la información del usuario autenticado
   * @returns Información del usuario o `null` si no está autenticado
   */
  getAuthenticatedUser(): Promise<any | null>;

  /**
   * Obtiene el token de acceso actual
   * @returns Token de acceso o `null` si no está autenticado
   */
  getAccessToken(): string | null;
}

/**
 * Interfaz para implementaciones de HttpClient
 * Incluye la autenticación y otros métodos necesarios para implementaciones concretas
 */
export interface HttpImplementation extends HttpClient {
  /**
   * Configura los interceptores para manejar tokens
   */
  _setupInterceptors(): void;

  /**
   * Refresca el token de autenticación
   * @returns El nuevo token de autenticación
   */
  _refreshToken(): Promise<string>;

  /**
   * Maneja el fallo al refrescar el token
   */
  _handleRefreshTokenFailure(): Promise<void>;

  /**
   * Decodifica un token JWT
   * @param token Token JWT
   * @returns Payload del token decodificado
   */
  _decodeToken(token: string): any;

  /**
   * Verifica si un token está expirado
   * @param token Token a verificar o timestamp de expiración
   * @returns `true` si está expirado, `false` en caso contrario
   */
  _isTokenExpired(token: string | number): boolean;

  /**
   * Almacena un token en el almacenamiento configurado
   * @param key Clave del token
   * @param value Valor del token
   */
  _storeToken(key: string, value: string): void;

  /**
   * Obtiene un token del almacenamiento configurado
   * @param key Clave del token
   * @returns Token almacenado o `null` si no existe
   */
  _getToken(key: string): string | null;

  /**
   * Elimina un token del almacenamiento configurado
   * @param key Clave del token
   */
  _removeToken(key: string): void;
}

/**
 * Datos de respuesta de error de la API
 */
export interface ErrorResponse {
  message?: string;
  code?: string;
}

/**
 * @internal Procesa respuestas HTTP
 */
export interface HttpResponseProcessor {
  processResponse<T>(response: AxiosResponse<T>): ApiResponse<T>;
}

/**
 * @internal Ejecuta peticiones HTTP
 */
export interface HttpRequestExecutor {
  executeRequest<T>(
    endpoint: string,
    method: HttpMethod,
    headers: Record<string, string>,
    body: unknown | undefined,
    signal: AbortSignal
  ): Promise<AxiosResponse<T>>;
}

/**
 * @internal Maneja reintentos de peticiones
 */
export interface HttpRetryHandler {
  executeWithRetry<T>(
    endpoint: string,
    method: HttpMethod,
    headers: Record<string, string>,
    body: unknown | undefined,
    timeout: number,
    retriesLeft: number
  ): Promise<ApiResponse<T>>;

  handleRetry<T>(
    error: unknown,
    retryCallback: () => Promise<ApiResponse<T>>,
    retriesLeft: number
  ): Promise<ApiResponse<T>>;

  isRetryableError(error: unknown): boolean;
  waitForRetry(retriesLeft: number): Promise<void>;
}

/**
 * @internal Maneja errores HTTP
 */
export interface HttpErrorHandler {
  handleError(error: unknown): ApiResponse<never>;
}


export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponseWithPagination<T> extends ApiResponse<T> {
  pagination: PaginationMeta | null;
}

/**
 * Tipos de autenticación soportados
 */
export type AuthType = 'jwt' | 'oauth2' | 'basic' | 'session';

/**
 * Opciones para el almacenamiento de tokens
 */
export type StorageType = 'localStorage' | 'sessionStorage' | 'secureStorage' | 'memory';

/**
 * Configuración del sistema de autenticación
 */
export interface AuthConfig {
  /**
   * Tipo de autenticación a utilizar
   * @default 'jwt'
   */
  type: AuthType;

  /**
   * Endpoints para la autenticación
   */
  endpoints: {
    /**
     * Endpoint para obtener token (login)
     */
    token: string;

    /**
     * Endpoint para refrescar token
     */
    refresh?: string;

    /**
     * Endpoint para cerrar sesión
     */
    logout?: string;

    /**
     * Endpoint para obtener información del usuario
     */
    userInfo?: string;
  };

  /**
   * ID de cliente (para OAuth2)
   */
  clientId?: string;

  /**
   * Secreto de cliente (para OAuth2)
   */
  clientSecret?: string;

  /**
   * Tipo de almacenamiento para tokens
   * @default 'localStorage'
   */
  storage: StorageType;

  /**
   * Nombres de las claves para almacenar tokens
   */
  tokenKeys: {
    /**
     * Clave para el token de acceso
     * @default 'token'
     */
    accessToken: string;

    /**
     * Clave para el token de refresco
     * @default 'refreshToken'
     */
    refreshToken?: string;
  };

  /**
   * Refrescar automáticamente el token antes de que expire
   * @default true
   */
  autoRefresh: boolean;

  /**
   * Margen de tiempo (en segundos) antes de la expiración para refrescar el token
   * @default 60
   */
  refreshMargin?: number;

  /**
   * Callback a ejecutar en caso de error de autenticación
   */
  onAuthError?: (error: any) => void;
}

/**
 * Credenciales de usuario para login
 */
export interface UserCredentials {
  username: string;
  password: string;
  [key: string]: any; // Campos adicionales
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
