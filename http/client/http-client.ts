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
import { httpLogger } from '../http-logger';

// Manager imports
import { HttpPropertyManager } from './http-property-manager';
import { HttpAuthManager } from './http-auth-manager';
import { HttpConfigManager } from './http-config-manager';
import { HttpOperations } from './http-operations';

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

  // Streaming
  async stream<T>(endpoint: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ReadableStream<T>> {
    return streamingManager.stream<T>(endpoint, options);
  }

  // Métodos de utilidad
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

  /**
   * Logger instance for automatic error handling
   */
  public logger = httpLogger;
}
