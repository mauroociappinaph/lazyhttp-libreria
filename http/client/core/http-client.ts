import { HttpCore } from '../../http-core';
import { ApiResponse, AuthConfig, AuthInfo, HttpClient as IHttpClient, RequestOptions, UserCredentials } from '../../types/core.types';
import { ProxyConfig } from '../../types/proxy.types';
import { StreamConfig } from '../../types/stream.types';

import { interceptorsManager } from '../../interceptors/http-interceptors-manager';

import { httpLogger } from '../../http-logger';
import { ServiceFactory, type ServiceContainer } from '../../services/index';
import { buildUrl, createProxyAgent, prepareRequestHeaders } from '../helpers/http-client.helpers';
import { HttpAuthManager } from '../managers/http-auth-manager';
import { HttpConfigManager } from '../managers/http-config-manager';
import { HttpOperationsManager } from '../managers/http-operations-manager';
import { HttpPropertyManager } from '../managers/http-property-manager';
import { createResourceAccessor } from '../utils/create-resource-accessor';
import { HttpOperations } from './http-operations';

export class HttpClient implements IHttpClient, HttpOperations {
  private core = new HttpCore();
  private propertyManager: HttpPropertyManager;
  private authManager: HttpAuthManager;
  private configManager: HttpConfigManager;
  private operationsManager: HttpOperationsManager;
  private services: ServiceContainer;

  public readonly get: HttpOperations['get'];
  public readonly getAll: HttpOperations['getAll'];
  public readonly getById: HttpOperations['getById'];
  public readonly post: HttpOperations['post'];
  public readonly put: HttpOperations['put'];
  public readonly patch: HttpOperations['patch'];
  public readonly delete: HttpOperations['delete'];
  public readonly stream: HttpOperations['stream'];

  constructor() {
    this.propertyManager = new HttpPropertyManager(this.core);
    this.authManager = new HttpAuthManager();
    this.configManager = new HttpConfigManager(this.propertyManager);
    this.operationsManager = new HttpOperationsManager(this.core);

    // Inicializar servicios centralizados
    this.services = ServiceFactory.createNodeServices(
      this.authManager,
      this.configManager,
      {} // metricsConfig - se puede configurar después
    );

    this.get = createResourceAccessor(this.operationsManager.get.bind(this.operationsManager), this) as HttpOperations['get'];
    this.getAll = createResourceAccessor(this.operationsManager.getAll.bind(this.operationsManager), this) as HttpOperations['getAll'];
    this.getById = createResourceAccessor(this.operationsManager.getById.bind(this.operationsManager), this) as HttpOperations['getById'];
    this.post = createResourceAccessor(this.operationsManager.post.bind(this.operationsManager), this) as HttpOperations['post'];
    this.put = createResourceAccessor(this.operationsManager.put.bind(this.operationsManager), this) as HttpOperations['put'];
    this.patch = createResourceAccessor(this.operationsManager.patch.bind(this.operationsManager), this) as HttpOperations['patch'];
    this.delete = createResourceAccessor(this.operationsManager.delete.bind(this.operationsManager), this) as HttpOperations['delete'];
    this.stream = createResourceAccessor(this.operationsManager.stream.bind(this.operationsManager), this) as HttpOperations['stream'];
  }

  public request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.operationsManager.request<T>(endpoint, options);
  }

  // Delegated properties
  get _baseUrl(): string | undefined { return this.propertyManager.baseUrl; }
  set _baseUrl(url: string | undefined) { this.propertyManager.baseUrl = url; }

  get _frontendUrl(): string | undefined { return this.propertyManager.frontendUrl; }
  set _frontendUrl(url: string | undefined) { this.propertyManager.frontendUrl = url; }

  get _defaultTimeout(): number { return this.propertyManager.defaultTimeout; }
  set _defaultTimeout(timeout: number) { this.propertyManager.defaultTimeout = timeout; }

  get _defaultRetries(): number { return this.propertyManager.defaultRetries; }
  set _defaultRetries(retries: number) { this.propertyManager.defaultRetries = retries; }

  get _defaultHeaders(): Record<string, string> { return this.propertyManager.defaultHeaders; }
  set _defaultHeaders(headers: Record<string, string>) { this.propertyManager.defaultHeaders = headers; }

  get _proxyConfig(): ProxyConfig | undefined { return this.propertyManager.proxyConfig; }
  set _proxyConfig(config: ProxyConfig | undefined) { this.propertyManager.proxyConfig = config; }

  get _defaultStreamConfig(): StreamConfig | undefined { return this.propertyManager.streamConfig; }
  set _defaultStreamConfig(config: StreamConfig | undefined) { this.propertyManager.streamConfig = config; }

  // Interceptors
  get _requestInterceptors() { return interceptorsManager.getRequestInterceptors(); }
  get _responseInterceptors() { return interceptorsManager.getResponseInterceptors(); }
  _setupInterceptors(): void { /* Future implementation */ }

  // Auth methods - delegados a servicios centralizados
  public configureAuth(config: AuthConfig): void { this.services.authService.configureAuth(config); }
  public async login(credentials: UserCredentials): Promise<AuthInfo> { return this.services.authService.login(credentials); }
  public async logout(): Promise<void> { return this.services.authService.logout(); }
  public isAuthenticated(): boolean { return this.services.authService.isAuthenticated(); }
  public async getAuthenticatedUser(): Promise<unknown | null> { return this.services.authService.getAuthenticatedUser(); }
  public getAccessToken(): string | null { return this.services.authService.getAccessToken(); }
  public async _refreshToken(): Promise<string> { return this.services.authService.refreshToken(); }
  public async _handleRefreshTokenFailure(): Promise<void> { return this.services.authService.handleRefreshTokenFailure(); }
  public _isTokenExpired(token: string | number): boolean { return this.authManager.isTokenExpired(token); }
  public _storeToken(key: string, value: string): void { this.authManager.storeToken(key, value); }
  public _getToken(key: string): string | null { return this.authManager.getToken(key); }
  public _removeToken(key: string): void { this.authManager.removeToken(key); }
  public _decodeToken(): unknown { return null; /* Future implementation */ }

  // Config methods
  public async initialize(config?: any): Promise<void> {
    await this.configManager.initialize(config);
  }
  public configureCaching(config?: any): void { this.services.cacheService.configureCaching(config); }
  public invalidateCache(pattern: string): void { this.services.cacheService.invalidateCache(pattern); }
  public invalidateCacheByTags(tags: string[]): void { this.services.cacheService.invalidateCacheByTags(tags); }
  public configureMetrics(config?: unknown): void { this.services.metricsService.configureMetrics(config); }
  public trackActivity(type: string): void { this.services.metricsService.trackActivity(type); }
  public getCurrentMetrics() { return this.services.metricsService.getCurrentMetrics(); }
  public configureProxy(config: ProxyConfig): void { this.configManager.configureProxy(config); }

  // Utility methods
  public _buildUrl(endpoint: string): string { return buildUrl(endpoint, this._baseUrl); }
  public _prepareHeaders(options: RequestOptions): Record<string, string> { return prepareRequestHeaders(options); }
  public _createProxyAgent(proxyConfig?: ProxyConfig) { return createProxyAgent(proxyConfig); }

  public logger = httpLogger;
}
