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

  /**
   * Configuración de caché para la petición
   */
  cache?: CacheOptions;

  /**
   * Configuración de proxy para esta petición
   */
  proxy?: ProxyConfig;

  /**
   * Configuración de streaming para esta petición
   */
  stream?: StreamConfig;

  /**
   * Función o lista de funciones para transformar la petición antes de enviarla
   */
  transformRequest?: ((data: unknown, headers?: Record<string, string>) => unknown) | Array<(data: unknown, headers?: Record<string, string>) => unknown>;

  /**
   * Función o lista de funciones para transformar la respuesta antes de resolverla
   */
  transformResponse?: ((data: unknown) => unknown) | Array<(data: unknown) => unknown>;
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
   * Código de error (si lo hay)
   */
  code?: string;

  /**
   * Metadatos adicionales de la respuesta
   */
  meta?: Record<string, unknown>;

  /**
   * Detalles adicionales del error (si lo hay)
   */
  details?: {
    description: string;
    cause: string;
    solution: string;
    example?: string;
  };

  /**
   * Advanced response metadata (request/response headers, timing, rawBody, errorDetails)
   */
  fullMeta?: {
    requestHeaders: Record<string, string>;
    responseHeaders: Record<string, string>;
    timing: { requestStart: number; responseEnd: number };
    rawBody: string | Buffer;
    errorDetails?: any;
  };
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
   * @param config Configuración opcional
   */
  initialize(config?: {
    suggestionService?: { enabled: boolean, url: string },
    cache?: CacheConfig
  }): Promise<void>;

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

  /**
   * Configura el sistema de caché
   * @param config Configuración de caché
   */
  configureCaching(config: CacheConfig): void;

  /**
   * Invalida entradas de caché que coincidan con un patrón
   * @param pattern Patrón para invalidar (se puede usar * como comodín)
   */
  invalidateCache(pattern: string): void;

  /**
   * Invalida entradas de caché con ciertos tags
   * @param tags Tags para invalidar
   */
  invalidateCacheByTags(tags: string[]): void;
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

  /**
   * Configura el proxy global para todas las peticiones
   * @param config Configuración del proxy
   */
  configureProxy(config: ProxyConfig): void;

  /**
   * Realiza una petición con streaming
   * @param endpoint Endpoint al que realizar la petición
   * @param options Opciones de la petición
   * @returns Stream de datos
   */
  stream<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ReadableStream<T>>;

  /**
   * Construye la URL completa basada en la URL base y el endpoint
   * @param endpoint Endpoint a construir
   * @returns URL completa
   */
  _buildUrl(endpoint: string): string;

  /**
   * Prepara las cabeceras HTTP para la petición
   * @param options Opciones de la petición
   * @returns Cabeceras HTTP preparadas
   */
  _prepareHeaders(options: RequestOptions): Record<string, string>;

  /**
   * Crea un agente de proxy basado en la configuración
   * @param proxyConfig Configuración del proxy
   * @returns Agente de proxy o undefined si no hay configuración
   */
  _createProxyAgent(proxyConfig?: ProxyConfig): any;
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
  processResponse<T>(
    response: import('axios').AxiosResponse<T>,
    metaOpcional?: {
      requestHeaders?: Record<string, string>;
      timing?: Record<string, number>;
      rawBody?: string | Uint8Array;
    }
  ): ApiResponse<T>;
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
    retriesLeft: number,
    metaOpcional?: {
      requestStart?: number;
    }
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

/**
 * Detalles de un error HTTP
 */
export interface ErrorDetails {
  /**
   * Descripción detallada del error
   */
  description: string;

  /**
   * Causa probable del error
   */
  cause: string;

  /**
   * Pasos para resolver el error
   */
  solution: string;

  /**
   * Ejemplo de código para evitar o manejar el error
   */
  example?: string;
}

export class HttpError extends Error {
  suggestion?: string;
  details?: ErrorDetails;

  static ERROR_MESSAGES: Record<string, string> = {
    TIMEOUT: 'La solicitud ha excedido el tiempo de espera',
    NETWORK: 'Error de conexión con el servidor',
    UNKNOWN: 'Error desconocido',
    ABORTED: 'La solicitud fue cancelada por timeout',
    SESSION_EXPIRED: 'La sesión ha expirado',
    AXIOS_ERROR: 'Error de conexión con AxiosError',
  };
}


export interface ErrorInfo {
  error_type: string;
  status_code?: number;
  url_pattern?: string;
  method?: string;
  message?: string;
}

/**
 * Estrategias de caché soportadas
 */
export type CacheStrategy =
  | 'cache-first'           // Intenta usar caché, si no existe o expiró va a la red
  | 'network-first'         // Intenta usar la red, si falla usa caché
  | 'stale-while-revalidate' // Usa caché mientras refresca en segundo plano
  | 'network-only'          // Solo usa la red, nunca la caché
  | 'cache-only';           // Solo usa la caché, nunca la red

/**
 * Modos de almacenamiento de caché
 */
export type CacheStorageType = 'memory' | 'localStorage' | 'indexedDB';

/**
 * Opciones de caché para una petición
 */
export interface CacheOptions {
  /**
   * Indica si se debe usar la caché para esta petición
   * @default true si la caché global está habilitada
   */
  enabled?: boolean;

  /**
   * Estrategia de caché a utilizar
   * @default La estrategia global configurada
   */
  strategy?: CacheStrategy;

  /**
   * Tiempo de vida de la entrada en caché (en milisegundos)
   * @default El TTL global configurado
   */
  ttl?: number;

  /**
   * Clave de caché personalizada (por defecto se genera a partir del endpoint y parámetros)
   */
  key?: string;

  /**
   * Tags para agrupar entradas de caché para invalidación
   */
  tags?: string[];
}

/**
 * Configuración global del sistema de caché
 */
export interface CacheConfig {
  /**
   * Indica si la caché está habilitada globalmente
   * @default false
   */
  enabled: boolean;

  /**
   * Estrategia de caché por defecto
   * @default 'cache-first'
   */
  defaultStrategy?: CacheStrategy;

  /**
   * Tiempo de vida por defecto (en milisegundos)
   * @default 5 * 60 * 1000 (5 minutos)
   */
  defaultTTL?: number;

  /**
   * Tipo de almacenamiento para la caché
   * @default 'memory'
   */
  storage?: CacheStorageType;

  /**
   * Tamaño máximo de la caché (número de entradas)
   * @default 100
   */
  maxSize?: number;
}

/**
 * Entrada de caché
 */
export interface CacheEntry<T> {
  /**
   * Valor almacenado en caché
   */
  value: ApiResponse<T>;

  /**
   * Timestamp de expiración
   */
  expiresAt: number;

  /**
   * Timestamp de creación
   */
  createdAt: number;

  /**
   * Timestamp de último acceso
   */
  lastAccessed: number;

  /**
   * Tags asociados
   */
  tags?: string[];
}

/**
 * Métricas de sesión del usuario
 */
export interface SessionMetrics {
  /**
   * Tiempo de inicio de la sesión (timestamp)
   */
  loginTime: number;

  /**
   * Última actividad registrada (timestamp)
   */
  lastActivity: number;

  /**
   * Tiempo total acumulado en esta sesión (en ms)
   */
  activeTime: number;

  /**
   * Tiempo de cierre de sesión, si está disponible
   */
  logoutTime?: number;

  /**
   * Número de solicitudes HTTP realizadas
   */
  requestCount: number;

  /**
   * Mapa de tipos de actividades y sus conteos
   * Ejemplo: { 'click': 5, 'form_submit': 2 }
   */
  activities: Record<string, number>;

  /**
   * Rutas visitadas durante la sesión
   */
  visitedRoutes: string[];

  /**
   * ID de sesión único
   */
  sessionId: string;
}

/**
 * Configuración del sistema de métricas
 */
export interface MetricsConfig {
  /**
   * Si las métricas están habilitadas
   */
  enabled: boolean;

  /**
   * URL del endpoint para enviar métricas
   */
  endpoint?: string;

  /**
   * Intervalo para enviar métricas al servidor (en ms)
   * Si es 0, solo se envían al cerrar sesión
   */
  reportingInterval?: number;

  /**
   * Si se debe rastrear la ruta activa
   */
  trackRoutes?: boolean;

  /**
   * Eventos del usuario a rastrear (clicks, form_submit, etc.)
   */
  trackEvents?: string[];

  /**
   * Función a ejecutar cuando hay nuevas métricas
   */
  onMetricsUpdate?: (metrics: SessionMetrics) => void;
}

/**
 * Configuración de proxy
 */
export interface ProxyConfig {
  /**
   * URL del proxy
   */
  url: string;

  /**
   * Credenciales del proxy (opcional)
   */
  auth?: {
    username: string;
    password: string;
  };

  /**
   * Protocolo del proxy (http, https, socks)
   * @default 'http'
   */
  protocol?: 'http' | 'https' | 'socks';

  /**
   * Si se debe ignorar el certificado SSL del proxy
   * @default false
   */
  rejectUnauthorized?: boolean;
}

/**
 * Configuración de streaming
 */
export interface StreamConfig {
  /**
   * Si se debe usar streaming para esta petición
   * @default false
   */
  enabled?: boolean;

  /**
   * Tamaño del chunk en bytes
   * @default 8192
   */
  chunkSize?: number;

  /**
   * Callback para procesar cada chunk de datos
   */
  onChunk?: (chunk: any) => void;

  /**
   * Callback para cuando el streaming ha terminado
   */
  onEnd?: () => void;

  /**
   * Callback para manejar errores durante el streaming
   */
  onError?: (error: Error) => void;
}
