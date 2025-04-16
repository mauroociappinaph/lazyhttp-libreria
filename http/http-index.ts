// Importación simplificada desde barrels
import {
  // Core
  HttpImplementation,
  RequestOptions,
  ApiResponse,
  HttpCore,
  prepareHeaders,

  // Auth
  AuthConfig,
  UserCredentials,
  AuthInfo,
  configureAuthHelper,
  loginHelper,
  logoutHelper,
  isAuthenticatedHelper,
  getAuthenticatedUserHelper,
  getAccessTokenHelper,
  refreshTokenAuthHelper,
  handleRefreshTokenFailureAuthHelper,
  decodeTokenHelper,
  isTokenExpiredHelper,
  storeTokenHelper,
  getTokenHelper,
  removeTokenHelper,

  // Config
  ProxyConfig,
  StreamConfig,
  httpConfiguration,
  interceptorsManager,

  // Metrics
  MetricsConfig,
  metricsManager,

  // Cache
  CacheConfig,

  // Streaming
  streamingManager
} from './barrels';

// Importaciones directas que necesitamos
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';

const DEFAULT_TIMEOUT = 10000; // 10 segundos
const DEFAULT_RETRIES = 0;

/**
 * Implementación principal del cliente HTTP
 * Combina todos los módulos para proporcionar una API unificada
 */
class HttpClient implements HttpImplementation {
  private core = new HttpCore();

  // Propiedades para compatibilidad con la API existente
  get _baseUrl(): string | undefined {
    return httpConfiguration.baseUrl;
  }

  set _baseUrl(url: string | undefined) {
    httpConfiguration.baseUrl = url;
    this.core._baseUrl = url;
  }

  get _frontendUrl(): string | undefined {
    return httpConfiguration.frontendUrl;
  }

  set _frontendUrl(url: string | undefined) {
    httpConfiguration.frontendUrl = url;
  }

  get _defaultTimeout(): number {
    return httpConfiguration.defaultTimeout;
  }

  set _defaultTimeout(timeout: number) {
    httpConfiguration.defaultTimeout = timeout;
    this.core._defaultTimeout = timeout;
  }

  get _defaultRetries(): number {
    return httpConfiguration.defaultRetries;
  }

  set _defaultRetries(retries: number) {
    httpConfiguration.defaultRetries = retries;
    this.core._defaultRetries = retries;
  }

  get _defaultHeaders(): Record<string, string> {
    return httpConfiguration.defaultHeaders;
  }

  set _defaultHeaders(headers: Record<string, string>) {
    httpConfiguration.defaultHeaders = headers;
    this.core._defaultHeaders = headers;
  }

  get _requestInterceptors(): Array<(config: any) => any> {
    return interceptorsManager.getRequestInterceptors();
  }

  get _responseInterceptors(): Array<(response: any) => any> {
    return interceptorsManager.getResponseInterceptors();
  }

  get _proxyConfig(): ProxyConfig | undefined {
    return httpConfiguration.proxyConfig;
  }

  set _proxyConfig(config: ProxyConfig | undefined) {
    if (config) {
      httpConfiguration.configureProxy(config);
    }
  }

  get _defaultStreamConfig(): StreamConfig | undefined {
    return httpConfiguration.streamConfig;
  }

  set _defaultStreamConfig(config: StreamConfig | undefined) {
    if (config) {
      httpConfiguration.configureStream(config);
    }
  }

  // Métodos de HTTP
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.core.request<T>(endpoint, options);
  }

  async get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.core.get<T>(endpoint, options);
  }

  async getAll<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.core.getAll<T>(endpoint, options);
  }

  async getById<T>(endpoint: string, id: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.core.getById<T>(endpoint, id, options);
  }

  async post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.core.post<T>(endpoint, body, options);
  }

  async put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.core.put<T>(endpoint, body, options);
  }

  async patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.core.patch<T>(endpoint, body, options);
  }

  async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.core.delete<T>(endpoint, options);
  }

  // Método de interceptores
  _setupInterceptors(interceptor?: any, type?: 'request' | 'response'): void {
    interceptorsManager.setupInterceptors(interceptor, type);
  }

  // Métodos de autenticación
  configureAuth(config: AuthConfig): void {
    configureAuthHelper(config);
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
    return isAuthenticatedHelper();
  }

  async getAuthenticatedUser(): Promise<any | null> {
    return getAuthenticatedUserHelper();
  }

  getAccessToken(): string | null {
    return getAccessTokenHelper();
  }

  // Métodos internos para la implementación
  async _refreshToken(): Promise<string> {
    return refreshTokenAuthHelper();
  }

  async _handleRefreshTokenFailure(): Promise<void> {
    return handleRefreshTokenFailureAuthHelper();
  }

  _decodeToken(token: string): any {
    return decodeTokenHelper(token);
  }

  _isTokenExpired(token: string | number): boolean {
    return isTokenExpiredHelper(token);
  }

  _storeToken(key: string, value: string): void {
    storeTokenHelper(key, value);
  }

  _getToken(key: string): string | null {
    return getTokenHelper(key);
  }

  _removeToken(key: string): void {
    removeTokenHelper(key);
  }

  // Métodos de configuración
  async initialize(config?: {
    baseUrl?: string,
    frontendUrl?: string,
    suggestionService?: { enabled: boolean, url: string },
    cache?: CacheConfig,
    metrics?: MetricsConfig,
    timeout?: number,
    retries?: number,
    headers?: Record<string, string>,
    proxy?: ProxyConfig,
    stream?: StreamConfig
  }): Promise<void> {
    // Inicializar la configuración
    await httpConfiguration.initialize(config);

    // Sincronizar con las propiedades del core
    if (config?.baseUrl) {
      this.core._baseUrl = config.baseUrl;
    }

    if (config?.timeout) {
      this.core._defaultTimeout = config.timeout;
    }

    if (config?.retries !== undefined) {
      this.core._defaultRetries = config.retries;
    }

    if (config?.headers) {
      this.core._defaultHeaders = {...this.core._defaultHeaders, ...config.headers};
    }

    return Promise.resolve();
  }

  // Métodos de caché
  configureCaching(config: CacheConfig): void {
    httpConfiguration.configureCaching(config);
  }

  invalidateCache(pattern: string): void {
    httpConfiguration.invalidateCache(pattern);
  }

  invalidateCacheByTags(tags: string[]): void {
    httpConfiguration.invalidateCacheByTags(tags);
  }

  // Métodos de métricas
  configureMetrics(config: MetricsConfig): void {
    httpConfiguration.configureMetrics(config);
  }

  trackActivity(type: string): void {
    httpConfiguration.trackActivity(type);
  }

  getCurrentMetrics(): any {
    return httpConfiguration.getCurrentMetrics();
  }

  // Métricas de proxy
  configureProxy(config: ProxyConfig): void {
    httpConfiguration.configureProxy(config);
  }

  // Streaming
  async stream<T>(endpoint: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ReadableStream<T>> {
    return streamingManager.stream<T>(endpoint, options);
  }

  // Métodos requeridos por la interfaz
  _buildUrl(endpoint: string): string {
    return this.core._baseUrl ? `${this.core._baseUrl}${endpoint}` : endpoint;
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
}

// Crear la instancia singleton
export const http = new HttpClient() as HttpImplementation & {
  configureCaching: (config: CacheConfig) => void;
  invalidateCache: (pattern: string) => void;
  invalidateCacheByTags: (tags: string[]) => void;
  configureMetrics: (config: MetricsConfig) => void;
  trackActivity: (type: string) => void;
  getCurrentMetrics: () => any;
  _baseUrl?: string;
  _frontendUrl?: string;
  _defaultTimeout?: number;
  _defaultRetries?: number;
  _defaultHeaders?: Record<string, string>;
  _requestInterceptors: Array<(config: any) => any>;
  _responseInterceptors: Array<(response: any) => any>;
  _setupInterceptors: {
    (): void;
    (interceptor?: any, type?: 'request' | 'response'): void;
  };
  _proxyConfig?: ProxyConfig;
  _defaultStreamConfig?: StreamConfig;
};

// Exportar las funciones individuales para un uso más directo
export const request = http.request.bind(http);
export const get = http.get.bind(http);
export const getAll = http.getAll.bind(http);
export const getById = http.getById.bind(http);
export const post = http.post.bind(http);
export const put = http.put.bind(http);
export const patch = http.patch.bind(http);
export const del = http.delete.bind(http); // 'delete' es palabra reservada en JavaScript

// Exportar las funciones de autenticación
export const configureAuth = http.configureAuth.bind(http);
export const login = http.login.bind(http);
export const logout = http.logout.bind(http);
export const isAuthenticated = http.isAuthenticated.bind(http);
export const getAuthenticatedUser = http.getAuthenticatedUser.bind(http);
export const getAccessToken = http.getAccessToken.bind(http);

// Exportar caché
export const configureCaching = http.configureCaching.bind(http);
export const invalidateCache = http.invalidateCache.bind(http);
export const invalidateCacheByTags = http.invalidateCacheByTags.bind(http);

// Exportar initialize
export const initialize = http.initialize.bind(http);

// Exportar funciones de métricas
export const configureMetrics = http.configureMetrics.bind(http);
export const trackActivity = http.trackActivity.bind(http);
export const getCurrentMetrics = http.getCurrentMetrics.bind(http);






