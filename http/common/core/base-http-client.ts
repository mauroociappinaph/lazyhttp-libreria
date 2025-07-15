import { HttpClient, RequestOptions, ApiResponse, AuthConfig, UserCredentials, AuthInfo, CacheConfig, MetricsConfig, ProxyConfig, HttpMethod } from '../types';
import { RetryConfig, RetryOptions, InitConfig } from '../../types/core.types';
import { HttpUtils } from '../utils/http-utils';

/**
 * Clase base abstracta para clientes HTTP
 *
 * Proporciona implementaciones comunes para cliente y servidor,
 * mientras deja que las implementaciones específicas definan
 * el comportamiento dependiente del entorno.
 */
export abstract class BaseHttpClient implements HttpClient {
  // Propiedades compartidas
  protected baseUrl: string = '';
  protected frontendUrl: string = '';
  protected defaultTimeout: number = 10000;
  protected defaultRetries: number = 0;
  protected defaultHeaders: Record<string, string> = {};
  protected authConfig: Partial<AuthConfig> = {};
  protected cacheConfig: Partial<CacheConfig> = { enabled: false, defaultTTL: 300000 };
  protected metricsConfig: Partial<MetricsConfig> = { enabled: false };
  protected retryConfig: Partial<RetryConfig> = {
    enabled: false,
    maxRetries: 3,
    initialDelay: 300,
    backoffFactor: 2,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED']
  };
  protected proxyConfig?: ProxyConfig;
  protected transformRequest: ((data: unknown) => unknown)[] = [];
  protected transformResponse: ((data: unknown) => unknown)[] = [];

  // Propiedades para transformadores activos (solo durante una petición)
  protected _activeTransformRequest?: ((data: unknown) => unknown)[];
  protected _activeTransformResponse?: ((data: unknown) => unknown)[];

  // Método de inicialización común
  async initialize(config?: Partial<InitConfig>): Promise<void> {
    if (!config) return;
    if (config.baseUrl) this.baseUrl = config.baseUrl;
    if (config.frontendUrl) this.frontendUrl = config.frontendUrl;
    if (config.timeout !== undefined) this.defaultTimeout = config.timeout;
    if (config.retries !== undefined) this.defaultRetries = config.retries;
    if (config.headers) this.defaultHeaders = { ...this.defaultHeaders, ...config.headers };
    if (config.auth) this.authConfig = { ...this.authConfig, ...config.auth };
    if (config.cache) this.cacheConfig = { ...this.cacheConfig, ...config.cache };
    if (config.metrics) this.metricsConfig = { ...this.metricsConfig, ...config.metrics };
    if (config.retry) this.retryConfig = { ...this.retryConfig, ...config.retry };
    if (config.proxy) this.proxyConfig = config.proxy;
    if (config.transformRequest) {
      this.transformRequest = Array.isArray(config.transformRequest)
        ? config.transformRequest
        : [config.transformRequest];
    }
    if (config.transformResponse) {
      this.transformResponse = Array.isArray(config.transformResponse)
        ? config.transformResponse
        : [config.transformResponse];
    }
    this.onInitialize(config);
  }

  // Hook para inicialización específica de la plataforma (opcional)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onInitialize(_config: Partial<InitConfig>): void { /* parámetro no usado */ }

  // Métodos de utilidad comunes para cliente/servidor
  protected buildRequestUrl(endpoint: string): string {
    return HttpUtils.buildUrl(this.baseUrl, endpoint);
  }

  protected prepareHeaders(customHeaders: Record<string, string> = {}, withAuth: boolean = false): Record<string, string> {
    const headers = HttpUtils.mergeHeaders(this.defaultHeaders, customHeaders);

    if (withAuth && this.getAccessToken()) {
      headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
    }

    return headers;
  }

  protected parseErrorMessage(error: unknown): string {
    return HttpUtils.parseErrorMessage(error);
  }

  protected generateCacheKey(method: string, url: string, data?: unknown): string {
    return HttpUtils.generateCacheKey(method, url, data);
  }

  // Implementación de métodos HTTP comunes
  async get<T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async getAll<T>(url: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async getById<T>(url: string, id: string | number, options?: RequestOptions): Promise<ApiResponse<T>> {
    const fullUrl = `${url}/${id}`;
    return this.request<T>(fullUrl, { ...options, method: 'GET' });
  }

  async post<T>(url: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'POST', body: data });
  }

  async put<T>(url: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PUT', body: data });
  }

  async patch<T>(url: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PATCH', body: data });
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  // Métodos comunes relacionados con la autenticación
  configureAuth(config: Partial<AuthConfig>): void {
    this.authConfig = { ...this.authConfig, ...config };
  }

  // Estos métodos pueden tener implementaciones específicas, proporcionamos stubs
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async login(_credentials: UserCredentials): Promise<AuthInfo> {
    throw new Error("login() debe ser implementado por la clase derivada");
  }

  async logout(): Promise<void> {
    throw new Error("logout() debe ser implementado por la clase derivada");
  }

  isAuthenticated(): boolean {
    throw new Error("isAuthenticated() debe ser implementado por la clase derivada");
  }

  getAuthenticatedUser(): Promise<any | null> {
    throw new Error("getAuthenticatedUser() debe ser implementado por la clase derivada");
  }

  getAccessToken(): string | null {
    throw new Error("getAccessToken() debe ser implementado por la clase derivada");
  }

  // Métodos de configuración comunes
  configureCaching(config: Partial<CacheConfig>): void {
    this.cacheConfig = { ...this.cacheConfig, ...config };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  invalidateCache(_pattern: string): void {
    throw new Error("invalidateCache() debe ser implementado por la clase derivada");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  invalidateCacheByTags(_tags: string[]): void {
    throw new Error("invalidateCacheByTags() debe ser implementado por la clase derivada");
  }

  // Métodos de métricas comunes
  configureMetrics(config: Partial<MetricsConfig>): void {
    this.metricsConfig = { ...this.metricsConfig, ...config };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  trackActivity(_type: string): void {
    throw new Error("trackActivity() debe ser implementado por la clase derivada");
  }

  getCurrentMetrics(): unknown {
    throw new Error("getCurrentMetrics() debe ser implementado por la clase derivada");
  }

  // Configuración de proxy
  configureProxy(config: ProxyConfig): void {
    this.proxyConfig = config;
  }

  // Método auxiliar para calcular el tiempo de espera con backoff exponencial
  protected calculateRetryDelay(retryCount: number, options?: RetryOptions): number {
    const initialDelay = options?.initialDelay || this.retryConfig.initialDelay || 300;
    const backoffFactor = options?.backoffFactor || this.retryConfig.backoffFactor || 2;

    // Fórmula: initialDelay * (backoffFactor ^ retryCount)
    return initialDelay * Math.pow(backoffFactor, retryCount);
  }

  // Método para determinar si se debe reintentar una petición
  protected shouldRetry(error: unknown, retryCount: number, options?: RetryOptions): boolean {
    // Si el retry está desactivado o se alcanzó el número máximo de intentos
    const isEnabled = options?.enabled !== undefined
      ? options.enabled
      : this.retryConfig.enabled;

    if (!isEnabled) return false;

    const maxRetries = options?.maxRetries !== undefined
      ? options.maxRetries
      : (this.retryConfig.maxRetries || 3);

    if (retryCount >= maxRetries) return false;

    // Comprobar si el código de estado es reintentable
    if (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      Array.isArray(this.retryConfig.retryableStatusCodes) &&
      this.retryConfig.retryableStatusCodes.includes((error as { status?: number }).status!)
    ) {
      return true;
    }

    // Comprobar si el tipo de error es reintentable
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      Array.isArray(this.retryConfig.retryableErrors) &&
      this.retryConfig.retryableErrors.includes((error as { code?: string }).code!)
    ) {
      return true;
    }

    return false;
  }

  async request<T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const method = options?.method || 'GET'; // Asume GET si no se especifica
    const data = options?.body; // Asume que el cuerpo está en options.body

    // Combinar transformadores globales y de la petición
    const transformRequestFns = [
      ...this.transformRequest,
      ...(options?.transformRequest
        ? Array.isArray(options.transformRequest)
          ? options.transformRequest
          : [options.transformRequest]
        : [])
    ];
    const transformResponseFns = [
      ...this.transformResponse,
      ...(options?.transformResponse
        ? Array.isArray(options.transformResponse)
          ? options.transformResponse
          : [options.transformResponse]
        : [])
    ];
    // Guardar temporalmente los transformadores para esta petición
    this._activeTransformRequest = transformRequestFns;
    this._activeTransformResponse = transformResponseFns;
    // Llamar al método real (de la subclase)
    const result = await this._requestWithTransforms<T>(method, url, data, options);
    // Limpiar
    this._activeTransformRequest = undefined;
    this._activeTransformResponse = undefined;
    return result;
  }

  /**
   * Método interno que las subclases deben usar en vez de request para acceder a los transformadores activos
   */
  protected async _requestWithTransforms<T>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _method: HttpMethod,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _url: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data?: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    throw new Error('_requestWithTransforms() debe ser implementado por la clase derivada');
  }
}
