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
import { interceptorsManager } from '../../http-interceptors-manager';

// Metrics imports
import { metricsManager } from '../../metrics/http-metrics-index';

// Streaming imports
import { streamingManager } from '../../http-streaming';

// Direct dependencies
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { httpLogger } from '../../http-logger';

// Manager imports
import { HttpPropertyManager } from '../managers/http-property-manager';
import { HttpAuthManager } from '../managers/http-auth-manager';
import { HttpConfigManager } from '../managers/http-config-manager';
import { HttpOperations } from './http-operations';

// Helper genérico para crear funciones de acceso por recursos
function createResourceAccessor<F extends (...args: any[]) => any>(
  method: F
): F & { [resource: string]: F } {
  // Función base que manejará la llamada directa
  const accessor = function(this: any, ...args: Parameters<F>): ReturnType<F> {
    return method.apply(this, args);
  } as F;

  // Handler para el proxy que intercepta accesos por propiedad
  const handler: ProxyHandler<F> = {
    get(target, prop) {
      // Si es una propiedad estándar de función, devolver la propiedad original
      if (typeof prop === 'symbol' || prop in Function.prototype) {
        return (target as any)[prop];
      }

      // Para accesos como get['User'], devolver una función que llama al método original
      return function(this: any, ...args: Parameters<F>): ReturnType<F> {
        // Aquí podemos usar el nombre del recurso (prop) si queremos
        // console.log(`Accediendo al recurso: ${String(prop)}`);
        return method.apply(this, args);
      };
    },
    apply(_, thisArg, args) {
      return Reflect.apply(method, thisArg, args);
    }
  };

  // Crear un proxy para manejar el acceso por corchetes
  return new Proxy(accessor, handler) as F & { [resource: string]: F };
};

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

  constructor() {
    // Inicializar managers
    this.propertyManager = new HttpPropertyManager(this.core);
    this.authManager = new HttpAuthManager();
    this.configManager = new HttpConfigManager(this.propertyManager);
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

  get _requestInterceptors(): Array<(config: any) => any> {
    return interceptorsManager.getRequestInterceptors();
  }

  get _responseInterceptors(): Array<(response: any) => any> {
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

  // Métodos HTTP (implementa HttpOperations)
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.core.request<T>(endpoint, options);
  }

  // Implementación de get con soporte de acceso por recurso
  get = createResourceAccessor(async function<T>(this: HttpClient, endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.core.get<T>(endpoint, options);
  });

  // Implementación de getAll con soporte de acceso por recurso
  getAll = createResourceAccessor(async function<T>(this: HttpClient, endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.core.getAll<T>(endpoint, options);
  });

  // Implementación de getById con soporte de acceso por recurso
  getById = createResourceAccessor(async function<T>(this: HttpClient, endpoint: string, id: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.core.getById<T>(endpoint, id, options);
  });

  // Implementación de post con soporte de acceso por recurso
  post = createResourceAccessor(async function<T>(this: HttpClient, endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.core.post<T>(endpoint, body, options);
  });

  // Implementación de put con soporte de acceso por recurso
  put = createResourceAccessor(async function<T>(this: HttpClient, endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.core.put<T>(endpoint, body, options);
  });

  // Implementación de patch con soporte de acceso por recurso
  patch = createResourceAccessor(async function<T>(this: HttpClient, endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.core.patch<T>(endpoint, body, options);
  });

  // Implementación de delete con soporte de acceso por recurso
  delete = createResourceAccessor(async function<T>(this: HttpClient, endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.core.delete<T>(endpoint, options);
  });

  // Implementación de stream con soporte de acceso por recurso
  stream = createResourceAccessor(async function<T = unknown>(this: HttpClient, endpoint: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ReadableStream<T>> {
    return streamingManager.stream<T>(endpoint, options);
  });

  // Método de interceptores
  _setupInterceptors(interceptor?: any, type?: 'request' | 'response'): void {
    interceptorsManager.setupInterceptors(interceptor, type);
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

  async getAuthenticatedUser(): Promise<any | null> {
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

  _decodeToken(token: string): any {
    return this.authManager.decodeToken(token);
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
    cache?: any,
    metrics?: any,
    timeout?: number,
    retries?: number,
    headers?: Record<string, string>,
    proxy?: ProxyConfig,
    stream?: StreamConfig
  }): Promise<void> {
    return this.configManager.initialize(config);
  }

  // Métodos de caché delegados a configManager
  configureCaching(config: any): void {
    this.configManager.configureCaching(config);
  }

  invalidateCache(pattern: string): void {
    this.configManager.invalidateCache(pattern);
  }

  invalidateCacheByTags(tags: string[]): void {
    this.configManager.invalidateCacheByTags(tags);
  }

  // Métodos de métricas delegados a configManager
  configureMetrics(config: any): void {
    this.configManager.configureMetrics(config);
  }

  trackActivity(type: string): void {
    this.configManager.trackActivity(type);
  }

  getCurrentMetrics(): any {
    return this.configManager.getCurrentMetrics();
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
