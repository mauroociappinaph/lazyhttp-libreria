import { AxiosResponse } from 'axios';
import { HttpMethod, ApiResponse, RequestOptions, HttpClient } from './core.types';
import { ProxyConfig } from './proxy.types';

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
 * @internal Procesa respuestas HTTP
 */
export interface HttpResponseProcessor {
  processResponse<T>(
    response: AxiosResponse<T>,
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
