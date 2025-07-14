import {
  AuthInfo,
  UserCredentials,
  AuthConfig,
} from './auth.types';
import { CacheConfig, CacheOptions } from './cache.types';
import { ProxyConfig } from './proxy.types';
import { StreamConfig } from './stream.types';

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
