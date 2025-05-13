import { HttpImplementation, RequestOptions, ApiResponse, AuthConfig, UserCredentials, AuthInfo, CacheConfig, MetricsConfig, ProxyConfig, HttpMethod } from '../types';
import { HttpUtils } from '../utils/http-utils';

/**
 * Clase base abstracta para clientes HTTP
 *
 * Proporciona implementaciones comunes para cliente y servidor,
 * mientras deja que las implementaciones específicas definan
 * el comportamiento dependiente del entorno.
 */
export abstract class BaseHttpClient implements HttpImplementation {
  // Propiedades compartidas
  protected baseUrl: string = '';
  protected frontendUrl: string = '';
  protected defaultTimeout: number = 10000;
  protected defaultRetries: number = 0;
  protected defaultHeaders: Record<string, string> = {};
  protected authConfig: Partial<AuthConfig> = {};
  protected cacheConfig: Partial<CacheConfig> = { enabled: false, ttl: 300000 };
  protected metricsConfig: Partial<MetricsConfig> = { enabled: false };
  protected proxyConfig?: ProxyConfig;

  // Métodos abstractos que deben implementar las clases derivadas
  abstract request<T>(method: HttpMethod, url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>;

  // Método de inicialización común
  initialize(config: any): void {
    if (config.baseUrl) this.baseUrl = config.baseUrl;
    if (config.frontendUrl) this.frontendUrl = config.frontendUrl;
    if (config.timeout !== undefined) this.defaultTimeout = config.timeout;
    if (config.retries !== undefined) this.defaultRetries = config.retries;
    if (config.headers) this.defaultHeaders = { ...this.defaultHeaders, ...config.headers };
    if (config.auth) this.authConfig = { ...this.authConfig, ...config.auth };
    if (config.cache) this.cacheConfig = { ...this.cacheConfig, ...config.cache };
    if (config.metrics) this.metricsConfig = { ...this.metricsConfig, ...config.metrics };
    if (config.proxy) this.proxyConfig = config.proxy;

    // Permitir que las implementaciones específicas realicen inicialización adicional
    this.onInitialize(config);
  }

  // Hook para inicialización específica de la plataforma (opcional)
  protected onInitialize(_config: any): void {}

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

  protected parseErrorMessage(error: any): string {
    return HttpUtils.parseErrorMessage(error);
  }

  protected generateCacheKey(method: string, url: string, data?: any): string {
    return HttpUtils.generateCacheKey(method, url, data);
  }

  // Implementación de métodos HTTP comunes
  async get<T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, undefined, options);
  }

  async getAll<T>(url: string, options?: RequestOptions): Promise<ApiResponse<T[]>> {
    return this.request<T[]>('GET', url, undefined, options);
  }

  async getById<T>(url: string, id: string | number, options?: RequestOptions): Promise<ApiResponse<T>> {
    const fullUrl = `${url}/${id}`;
    return this.request<T>('GET', fullUrl, undefined, options);
  }

  async post<T>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data, options);
  }

  async put<T>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data, options);
  }

  async patch<T>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', url, data, options);
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, undefined, options);
  }

  // Métodos comunes relacionados con la autenticación
  configureAuth(config: Partial<AuthConfig>): void {
    this.authConfig = { ...this.authConfig, ...config };
  }

  // Estos métodos pueden tener implementaciones específicas, proporcionamos stubs
  async login(_credentials: UserCredentials): Promise<AuthInfo> {
    throw new Error("login() debe ser implementado por la clase derivada");
  }

  async logout(): Promise<void> {
    throw new Error("logout() debe ser implementado por la clase derivada");
  }

  isAuthenticated(): boolean {
    throw new Error("isAuthenticated() debe ser implementado por la clase derivada");
  }

  getAuthenticatedUser(): any | null {
    throw new Error("getAuthenticatedUser() debe ser implementado por la clase derivada");
  }

  getAccessToken(): string | null {
    throw new Error("getAccessToken() debe ser implementado por la clase derivada");
  }

  // Métodos de configuración comunes
  configureCaching(config: Partial<CacheConfig>): void {
    this.cacheConfig = { ...this.cacheConfig, ...config };
  }

  invalidateCache(_pattern: string): void {
    throw new Error("invalidateCache() debe ser implementado por la clase derivada");
  }

  invalidateCacheByTags(_tags: string[]): void {
    throw new Error("invalidateCacheByTags() debe ser implementado por la clase derivada");
  }

  // Métodos de métricas comunes
  configureMetrics(config: Partial<MetricsConfig>): void {
    this.metricsConfig = { ...this.metricsConfig, ...config };
  }

  trackActivity(_type: string): void {
    throw new Error("trackActivity() debe ser implementado por la clase derivada");
  }

  getCurrentMetrics(): any {
    throw new Error("getCurrentMetrics() debe ser implementado por la clase derivada");
  }

  // Configuración de proxy
  configureProxy(config: ProxyConfig): void {
    this.proxyConfig = config;
  }
}
