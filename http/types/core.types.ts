import { CacheOptions } from './cache.types';
import { ProxyConfig } from './proxy.types';
import { StreamConfig } from './stream.types';
import { AuthConfig, UserCredentials, AuthInfo } from './auth.types';

/**
 * Métodos HTTP soportados
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Opciones para las peticiones HTTP
 */
export interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  withAuth?: boolean;
  timeout?: number;
  retries?: number;
  params?: Record<string, string | number>;
  cache?: CacheOptions;
  proxy?: ProxyConfig;
  stream?: StreamConfig;
  transformRequest?: ((data: unknown, headers?: Record<string, string>) => unknown) | Array<(data: unknown, headers?: Record<string, string>) => unknown>;
  transformResponse?: ((data: unknown) => unknown) | Array<(data: unknown) => unknown>;
}

/**
 * Respuesta genérica de la API
 */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
  code?: string;
  meta?: Record<string, unknown>;
  details?: {
    description: string;
    cause: string;
    solution: string;
    example?: string;
  };
  fullMeta?: {
    requestHeaders?: Record<string, string>;
    responseHeaders: Record<string, string>;
    timing?: { requestStart: number; responseEnd: number };
    rawBody?: string | Buffer;
    errorDetails?: any;
  };
  config?: any;
}

/**
 * Procesador de respuestas HTTP
 */
export interface HttpResponseProcessor {
  processResponse<T>(
    response: any, // Usar 'any' para AxiosResponse para evitar dependencia circular
    metaOpcional?: {
      requestHeaders?: Record<string, string>;
      timing?: Record<string, number>;
      rawBody?: string | Uint8Array;
    }
  ): ApiResponse<T>;
}

/**
 * Ejecutor de peticiones HTTP
 */
export interface HttpRequestExecutor {
  execute<T>(
    endpoint: string,
    method: HttpMethod,
    headers: Record<string, string>,
    body: unknown | undefined,
    timeout: number,
    metaOpcional?: {
      requestStart?: number;
    }
  ): Promise<ApiResponse<T>>;
}

/**
 * Manejador de reintentos HTTP
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
 * Manejador de errores HTTP
 */
export interface HttpErrorHandler {
  handleError(error: unknown): ApiResponse<never>;
}

/**
 * Cliente HTTP - Interfaz pública
 */
export interface HttpClient {
  request<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>>;
  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
  getAll<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
  getById<T>(endpoint: string, id: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
  post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
  put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
  patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
  delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>>;
  initialize(config?: Partial<InitConfig>): Promise<void>;
  configureAuth(config: AuthConfig): void;
  login(credentials: UserCredentials): Promise<AuthInfo>;
  logout(): Promise<void>;
  isAuthenticated(): boolean;
  getAuthenticatedUser(): Promise<any | null>;
  getAccessToken(): string | null;
  configureCaching(config: import('./cache.types').CacheConfig): void;
  invalidateCache(pattern: string): void;
  invalidateCacheByTags(tags: string[]): void;
}

/**
 * Configuración de reintento automático
 */
export interface RetryConfig {
  enabled: boolean;
  maxRetries: number;
  initialDelay: number;
  backoffFactor: number;
  retryableStatusCodes?: number[];
  retryableErrors?: string[];
}

export interface RetryOptions {
  enabled?: boolean;
  maxRetries?: number;
  initialDelay?: number;
  backoffFactor?: number;
}

/**
 * Configuración de inicialización para clientes HTTP
 * - baseUrl: URL base para las peticiones (oficial)
 * - baseURL: alias aceptado para compatibilidad (se normaliza internamente)
 * - timeout: tiempo de espera por defecto
 * - headers: cabeceras por defecto
 */
export interface InitConfig {
  /**
   * URL base para las peticiones HTTP (usar preferentemente baseUrl)
   */
  baseUrl?: string;
  /**
   * Alias de baseUrl para compatibilidad (se normaliza internamente)
   */
  baseURL?: string;
  frontendUrl?: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  auth?: Partial<AuthConfig>;
  cache?: Partial<import('./cache.types').CacheConfig>;
  metrics?: Partial<import('./metrics.types').MetricsConfig>;
  retry?: Partial<RetryConfig>;
  proxy?: ProxyConfig;
  transformRequest?: ((data: unknown) => unknown) | Array<(data: unknown) => unknown>;
  transformResponse?: ((data: unknown) => unknown) | Array<(data: unknown) => unknown>;
}

export type { AuthConfig, UserCredentials, AuthInfo } from './auth.types';
export type { ProxyConfig } from './proxy.types';
export type { StreamConfig } from './stream.types';
export type { CacheConfig } from './cache.types';
export type { MetricsConfig } from './metrics.types';
export type { SessionMetrics } from './metrics.types';

