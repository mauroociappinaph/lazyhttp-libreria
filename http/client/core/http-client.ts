import { SocksProxyAgent } from 'socks-proxy-agent';
// Core imports
import { HttpCore } from '../../http-core';
import {
  HttpImplementation, RequestOptions, ApiResponse,
  AuthConfig, UserCredentials, AuthInfo,
  ProxyConfig, StreamConfig
} from '../../http.types';
import {
  prepareHeaders
} from '../../http-helpers';

// Auth imports
import {
  login as loginHelper,
  logout as logoutHelper
} from '../../http-auth';

// Configuration imports
import { interceptorsManager } from '../../interceptors/http-interceptors-manager';

// Metrics imports
import { metricsManager } from '../../metrics/http-metrics-index';

// Streaming imports
import { streamingManager } from '../../http-streaming';

// Direct dependencies
import { HttpsProxyAgent } from 'https-proxy-agent';

import { httpLogger } from '../../http-logger';

// Manager imports
import { HttpPropertyManager } from '../managers/http-property-manager';
import { HttpAuthManager } from '../managers/http-auth-manager';
import { HttpConfigManager } from '../managers/http-config-manager';
import { HttpOperations } from './http-operations';

// Helper genérico para crear funciones de acceso por recursos
function createResourceAccessor<
  P extends unknown[],
  R
>(
  method: (...args: P) => R,
  instance: object
): {
  (...args: P): R;
  [resource: string]: (...args: P) => R;
  [key: symbol]: (...args: P) => R;
} {
  const accessor = function (...args: P): R {
    return method.apply(instance, args);
  };
  const handler: ProxyHandler<typeof accessor> = {
    get(target, prop) {
      if (prop in Function.prototype) {
        return (target as never)[prop];
      }
      return function (...args: P): R {
        const endpoint = args[0];
        const newArgs = [endpoint, ...args.slice(1)] as P;
        return method.apply(instance, newArgs);
      };
    },
    apply(_, __, args) {
      return Reflect.apply(method, instance, args);
    }
  };

  // Crear un proxy para manejar el acceso por corchetes
  return new Proxy(accessor, handler) as {
    (...args: P): R;
    [resource: string]: (...args: P) => R;
    [key: symbol]: (...args: P) => R;
  };
}

/**
 * Formatea el nombre del recurso según la convención deseada
 * Por defecto convierte a minúsculas y plural (users)
 * Si viene de un símbolo, mantiene el formato original (User → users)
 */
// function formatResource(resource: string): string {
//   // Si viene de un símbolo en PascalCase (User), convertir a API format (users)
//   if (/^[A-Z][a-zA-Z0-9]*$/.test(resource)) {
//     // Convertir de PascalCase a lowercase y pluralizar si no está en plural
//     const resourceLower = resource.charAt(0).toLowerCase() + resource.slice(1);
//     return resourceLower.endsWith('s') ? resourceLower : `${resourceLower}s`;
//   }
//   // Si ya viene como string con formato, devolverlo tal cual
//   return resource;
// }

/**
 * Implementación principal del cliente HTTP
 * Reorganizado siguiendo principios SOLID:
 * - Single Responsibility: Delegación a managers específicos
 * - Open/Closed: Extensible a través de managers independientes
 * - Liskov Substitution: Implementa interfaces claras
 * - Interface Segregation: Interfaces específicas para cada dominio
 * - Dependency Inversion: Dependencia de abstracciones, no implementaciones concretas
 */
export class HttpClient implements HttpImplementation, HttpOperations {
  private core = new HttpCore();

  // Managers para separación de responsabilidades
  private propertyManager: HttpPropertyManager;
  private authManager: HttpAuthManager;
  private configManager: HttpConfigManager;

  // Resource accessors inicializados
  get: HttpOperations['get'];
  getAll: HttpOperations['getAll'];
  getById: HttpOperations['getById'];
  post: HttpOperations['post'];
  put: HttpOperations['put'];
  patch: HttpOperations['patch'];
  delete: HttpOperations['delete'];
  stream: HttpOperations['stream'];

  constructor() {
    // Inicializar managers
    this.propertyManager = new HttpPropertyManager(this.core);
    this.authManager = new HttpAuthManager();
    this.configManager = new HttpConfigManager(this.propertyManager);

    // Inicializar los resource accessors vinculándolos a this
    this.get = createResourceAccessor(this.getMethod.bind(this), this) as HttpOperations['get'];
    this.getAll = createResourceAccessor(this.getAllMethod.bind(this), this) as HttpOperations['getAll'];
    this.getById = createResourceAccessor(this.getByIdMethod.bind(this), this) as HttpOperations['getById'];
    this.post = createResourceAccessor(this.postMethod.bind(this), this) as HttpOperations['post'];
    this.put = createResourceAccessor(this.putMethod.bind(this), this) as HttpOperations['put'];
    this.patch = createResourceAccessor(this.patchMethod.bind(this), this) as HttpOperations['patch'];
    this.delete = createResourceAccessor(this.deleteMethod.bind(this), this) as HttpOperations['delete'];
    this.stream = createResourceAccessor(this.streamMethod.bind(this), this) as HttpOperations['stream'];
  }

  // Propiedades delegadas al propertyManager
  get _baseUrl(): string | undefined {
    return this.propertyManager.baseUrl;
  }

  set _baseUrl(url: string | undefined) {
    this.propertyManager.baseUrl = url;
  }

  get _frontendUrl(): string | undefined {
    return this.propertyManager.frontendUrl;
  }

  set _frontendUrl(url: string | undefined) {
    this.propertyManager.frontendUrl = url;
  }

  get _defaultTimeout(): number {
    return this.propertyManager.defaultTimeout;
  }

  set _defaultTimeout(timeout: number) {
    this.propertyManager.defaultTimeout = timeout;
  }

  get _defaultRetries(): number {
    return this.propertyManager.defaultRetries;
  }

  set _defaultRetries(retries: number) {
    this.propertyManager.defaultRetries = retries;
  }

  get _defaultHeaders(): Record<string, string> {
    return this.propertyManager.defaultHeaders;
  }

  set _defaultHeaders(headers: Record<string, string>) {
    this.propertyManager.defaultHeaders = headers;
  }

  get _requestInterceptors(): Array<(config: Record<string, unknown>) => Record<string, unknown>> {
    return interceptorsManager.getRequestInterceptors();
  }

  get _responseInterceptors(): Array<(response: unknown) => unknown> {
    return interceptorsManager.getResponseInterceptors();
  }

  get _proxyConfig(): ProxyConfig | undefined {
    return this.propertyManager.proxyConfig;
  }

  set _proxyConfig(config: ProxyConfig | undefined) {
    this.propertyManager.proxyConfig = config;
  }

  get _defaultStreamConfig(): StreamConfig | undefined {
    return this.propertyManager.streamConfig;
  }

  set _defaultStreamConfig(config: StreamConfig | undefined) {
    this.propertyManager.streamConfig = config;
  }

  /**
   * Garantiza que la respuesta siempre tenga el campo fullMeta
   */
  private ensureFullMeta<T>(response: ApiResponse<T>, context: { endpoint: string, method: string, options?: any }) : ApiResponse<T> {
    if (response && typeof response === 'object' && 'fullMeta' in response && response.fullMeta) {
      return response;
    }
    // Si no existe, agregar un fullMeta mínimo
    let errorDetails: any = undefined;
    if (response && typeof response.error === 'object' && response.error !== null && 'details' in response.error) {
      errorDetails = (response.error as any).details;
    }
    return {
      ...response,
      fullMeta: {
        requestHeaders: context.options?.headers || ({} as Record<string, string>),
        responseHeaders: (response && typeof response === 'object' && 'headers' in response && response.headers)
          ? (response.headers as Record<string, string>)
          : ({} as Record<string, string>),
        timing: { requestStart: Date.now(), responseEnd: Date.now() },
        rawBody: typeof response.data === 'string' ? response.data : '',
        errorDetails
      }
    };
  }

  // Métodos HTTP (implementa HttpOperations)
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const resp = await this.core.request<T>(endpoint, options);
    return this.ensureFullMeta(resp, { endpoint, method: options.method || 'GET', options });
  }

  // Métodos base para los resource accessors
  async getMethod<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    const resp = await this.core.get<T>(endpoint, options);
    return this.ensureFullMeta(resp, { endpoint, method: 'GET', options });
  }

  async getAllMethod<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    const resp = await this.core.getAll<T>(endpoint, options);
    return this.ensureFullMeta(resp, { endpoint, method: 'GET', options });
  }

  async getByIdMethod<T>(endpoint: string, id: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    const resp = await this.core.getById<T>(endpoint, id, options);
    return this.ensureFullMeta(resp, { endpoint, method: 'GET', options });
  }

  async postMethod<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    const resp = await this.core.post<T>(endpoint, body, options);
    return this.ensureFullMeta(resp, { endpoint, method: 'POST', options });
  }

  async putMethod<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    const resp = await this.core.put<T>(endpoint, body, options);
    return this.ensureFullMeta(resp, { endpoint, method: 'PUT', options });
  }

  async patchMethod<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    const resp = await this.core.patch<T>(endpoint, body, options);
    return this.ensureFullMeta(resp, { endpoint, method: 'PATCH', options });
  }

  async deleteMethod<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    const resp = await this.core.delete<T>(endpoint, options);
    return this.ensureFullMeta(resp, { endpoint, method: 'DELETE', options });
  }

  async streamMethod(endpoint: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ReadableStream<unknown>> {
    return streamingManager.stream(endpoint, options);
  }

  // Resource accessors tipados correctamente
  // Método de interceptores
  _setupInterceptors(interceptor?: unknown, type?: 'request' | 'response'): void {
    void interceptor; void type; // Suprime warning de variables no usadas
    // Implementación futura
  }

  // Métodos de autenticación delegados a authManager
  configureAuth(config: AuthConfig): void {
    this.authManager.configureAuth(config);
  }

  async login(credentials: UserCredentials): Promise<AuthInfo> {
    const response = await loginHelper(credentials);

    const authInfo: AuthInfo = {
      accessToken: response.access_token,
      isAuthenticated: true,
      refreshToken: response.refresh_token
    };

    // Iniciar seguimiento de métricas si la autenticación fue exitosa
    if (authInfo.isAuthenticated) {
      metricsManager.startTracking();
    }

    return authInfo;
  }

  async logout(): Promise<void> {
    // Finalizar sesión de métricas y enviar datos
    const metrics = await metricsManager.stopTracking();

    // Si hay métricas y debug está activado, mostrar resumen
    if (metrics) {
      console.log(`[HTTP] Sesión finalizada - Tiempo activo: ${Math.round(metrics.activeTime / 1000)}s, Peticiones: ${metrics.requestCount}`);
    }

    return logoutHelper();
  }

  isAuthenticated(): boolean {
    return this.authManager.isAuthenticated();
  }

  async getAuthenticatedUser(): Promise<unknown | null> {
    return this.authManager.getAuthenticatedUser();
  }

  getAccessToken(): string | null {
    return this.authManager.getAccessToken();
  }

  // Métodos internos de autenticación
  async _refreshToken(): Promise<string> {
    return this.authManager.refreshToken();
  }

  async _handleRefreshTokenFailure(): Promise<void> {
    return this.authManager.handleRefreshTokenFailure();
  }

  _decodeToken(): unknown {
    // Implementación futura
    return null;
  }

  _isTokenExpired(token: string | number): boolean {
    return this.authManager.isTokenExpired(token);
  }

  _storeToken(key: string, value: string): void {
    this.authManager.storeToken(key, value);
  }

  _getToken(key: string): string | null {
    return this.authManager.getToken(key);
  }

  _removeToken(key: string): void {
    this.authManager.removeToken(key);
  }

  // Métodos de configuración delegados a configManager
  async initialize(config?: {
    baseUrl?: string,
    frontendUrl?: string,
    suggestionService?: { enabled: boolean, url: string },
    cache?: unknown,
    metrics?: unknown,
    timeout?: number,
    retries?: number,
    headers?: Record<string, string>,
    proxy?: ProxyConfig,
    stream?: StreamConfig
  }): Promise<void> {
    void config; // Suprime warning de variable no usada
    // Implementación futura
  }

  // Métodos de caché delegados a configManager
  configureCaching(config: unknown): void {
    void config; // Suprime warning de variable no usada
    // Implementación futura
  }

  invalidateCache(pattern: string): void {
    this.configManager.invalidateCache(pattern);
  }

  invalidateCacheByTags(tags: string[]): void {
    this.configManager.invalidateCacheByTags(tags);
  }

  // Métodos de métricas delegados a configManager
  configureMetrics(config: unknown): void {
    void config; // Suprime warning de variable no usada
    // Implementación futura
  }

  trackActivity(type: string): void {
    this.configManager.trackActivity(type);
  }

  getCurrentMetrics(): { requests: number; errors: number; cacheHits: number; cacheMisses: number } {
    // Implementación futura o delegar a metricsManager
    return {
      requests: 0,
      errors: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }

  // Configuración de proxy delegado a configManager
  configureProxy(config: ProxyConfig): void {
    this.configManager.configureProxy(config);
  }

  // Métodos de utilidad
  _buildUrl(endpoint: string): string {
    // Si ya es una URL completa, devolverla tal cual
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }

    // Si hay una URL base configurada, construir la URL completa
    if (this.core._baseUrl) {
      // Asegurar que no haya doble slash entre baseUrl y endpoint
      if (this.core._baseUrl.endsWith('/') && endpoint.startsWith('/')) {
        return `${this.core._baseUrl}${endpoint.substring(1)}`;
      }
      // Asegurar que haya un slash entre baseUrl y endpoint
      else if (!this.core._baseUrl.endsWith('/') && !endpoint.startsWith('/')) {
        return `${this.core._baseUrl}/${endpoint}`;
      }
      // Caso estándar: unir directamente
      return `${this.core._baseUrl}${endpoint}`;
    }

    // Si no hay baseUrl, devolver el endpoint tal cual
    return endpoint;
  }

  _prepareHeaders(options: RequestOptions): Record<string, string> {
    return prepareHeaders(options.headers || {}, options.withAuth || false);
  }

  _createProxyAgent(proxyConfig?: ProxyConfig) {
    if (!proxyConfig) return undefined;

    const { url, protocol = 'http', auth, rejectUnauthorized = false } = proxyConfig;
    const proxyUrl = new URL(url);

    if (auth) {
      proxyUrl.username = auth.username;
      proxyUrl.password = auth.password;
    }

    const proxyString = proxyUrl.toString();

    // Para SOCKS, usamos la URL directamente
    if (protocol === 'socks') {
      return new SocksProxyAgent(proxyString);
    }

    // Para HTTPS, configuramos las opciones específicas
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = rejectUnauthorized ? '1' : '0';
    return new HttpsProxyAgent(proxyString);
  }

  /**
   * Logger instance for automatic error handling
   */
  public logger = httpLogger;
}
