// Core imports
import { HttpCore } from '../http-core';
import {
  HttpImplementation, RequestOptions, ApiResponse,
  AuthConfig, UserCredentials, AuthInfo,
  ProxyConfig, StreamConfig
} from '../http.types';
import {
  prepareHeaders,
  refreshToken as refreshTokenHelper,
  handleRefreshTokenFailure as handleRefreshTokenFailureHelper
} from '../http-helpers';

// Auth imports
import {
  configureAuth as configureAuthHelper,
  login as loginHelper,
  logout as logoutHelper,
  isAuthenticated as isAuthenticatedHelper,
  getAuthenticatedUser as getAuthenticatedUserHelper,
  getAccessToken as getAccessTokenHelper,
  refreshToken as refreshTokenAuthHelper,
  handleRefreshTokenFailure as handleRefreshTokenFailureAuthHelper,
  decodeToken as decodeTokenHelper,
  isTokenExpired as isTokenExpiredHelper,
  storeToken as storeTokenHelper,
  getToken as getTokenHelper,
  removeToken as removeTokenHelper
} from '../http-auth';

// Configuration imports
import { httpConfiguration } from '../http-configuration';
import { interceptorsManager } from '../http-interceptors-manager';

// Metrics imports
import { metricsManager } from '../metrics/http-metrics-index';

// Streaming imports
import { streamingManager } from '../http-streaming';

// Direct dependencies
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';

/**
 * Implementación principal del cliente HTTP
 * Combina todos los módulos para proporcionar una API unificada
 */
export class HttpClient implements HttpImplementation {
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
    cache?: any,
    metrics?: any,
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
  configureCaching(config: any): void {
    httpConfiguration.configureCaching(config);
  }

  invalidateCache(pattern: string): void {
    httpConfiguration.invalidateCache(pattern);
  }

  invalidateCacheByTags(tags: string[]): void {
    httpConfiguration.invalidateCacheByTags(tags);
  }

  // Métodos de métricas
  configureMetrics(config: any): void {
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
