import { HttpImplementation, RequestOptions, ApiResponse, AuthConfig, UserCredentials, AuthInfo, CacheConfig, MetricsConfig } from './http.types';
import {
  retryHandler,
  errorHandler,
  prepareHeaders,
  setupInterceptors,
  refreshToken as refreshTokenHelper,
  handleRefreshTokenFailure as handleRefreshTokenFailureHelper,
  initialize as initializeHelper
} from './http-helpers';
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
} from './http-auth';
import { cacheManager } from './http-cache';
import { executeWithCacheStrategy } from './http-cache-strategies';
import { metricsManager } from './metrics/http-metrics-index';

const DEFAULT_TIMEOUT = 10000; // 10 segundos
const DEFAULT_RETRIES = 0;

export const http: HttpImplementation & {
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
} = {
  _baseUrl: undefined,
  _frontendUrl: undefined,
  _defaultTimeout: DEFAULT_TIMEOUT,
  _defaultRetries: DEFAULT_RETRIES,
  _defaultHeaders: {},
  _requestInterceptors: [],
  _responseInterceptors: [],

  _setupInterceptors(interceptor?: any, type?: 'request' | 'response'): void {
    // If no parameters were provided, initialize the arrays
    if (!interceptor && !type) {
      this._requestInterceptors = [];
      this._responseInterceptors = [];
      return;
    }

    // Add the interceptor to the appropriate array
    if (type === 'request') {
      this._requestInterceptors.push(interceptor);
    } else if (type === 'response') {
      this._responseInterceptors.push(interceptor);
    }
  },

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      withAuth = false,
      timeout = DEFAULT_TIMEOUT,
      retries = DEFAULT_RETRIES,
      cache: cacheOptions
    } = options;

    try {
      // Registrar la petición en métricas
      metricsManager.trackRequest(endpoint);

      // Comprobar si debemos usar la caché
      if (cacheManager.shouldUseCache(method, options)) {
        const cacheKey = cacheManager.generateCacheKey(endpoint, options);

        return await executeWithCacheStrategy<T>(
          cacheKey,
          async () => {
            const requestHeaders = prepareHeaders(headers, withAuth);
            const response = await retryHandler.executeWithRetry(
              this._baseUrl ? `${this._baseUrl}${endpoint}` : endpoint,
              method,
              requestHeaders,
              body,
              timeout || this._defaultTimeout || DEFAULT_TIMEOUT,
              retries !== undefined ? retries : this._defaultRetries !== undefined ? this._defaultRetries : DEFAULT_RETRIES
            ) as ApiResponse<T>;

            // Invalidar caché automáticamente para métodos de escritura
            if (method !== 'GET') {
              cacheManager.invalidateByMethod(method, endpoint);
            }

            return response;
          },
          options
        );
      }

      // Petición sin caché
      const requestHeaders = prepareHeaders(headers, withAuth);
      const response = await retryHandler.executeWithRetry(
        this._baseUrl ? `${this._baseUrl}${endpoint}` : endpoint,
        method,
        requestHeaders,
        body,
        timeout || this._defaultTimeout || DEFAULT_TIMEOUT,
        retries !== undefined ? retries : this._defaultRetries !== undefined ? this._defaultRetries : DEFAULT_RETRIES
      ) as ApiResponse<T>;

      // Invalidar caché automáticamente para métodos de escritura
      if (method !== 'GET') {
        cacheManager.invalidateByMethod(method, endpoint);
      }

      return response;
    } catch (error) {
      return errorHandler.handleError(error);
    }
  },

  // Métodos HTTP simplificados
  async get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  },

  async getAll<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    const page = options?.params?.page || 1;
    const limit = options?.params?.limit || 100;

    const response = await this.request<T>(endpoint, {
      ...options,
      method: 'GET',
      params: {
        ...options?.params,
        page,
        limit
      }
    });

    // Agregar metadatos de paginación a la respuesta
    if (response.data && Array.isArray(response.data)) {
      response.meta = {
        currentPage: page,
        totalItems: response.data.length
      };
    }

    return response;
  },

  async getById<T>(endpoint: string, id: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET', params: { id } });
  },

  async post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  },

  async put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  },

  async patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  },

  async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  },

  // Métodos de autenticación avanzada
  configureAuth(config: AuthConfig): void {
    configureAuthHelper(config);
  },

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
  },

  async logout(): Promise<void> {
    // Finalizar sesión de métricas y enviar datos
    const metrics = await metricsManager.stopTracking();

    // Si hay métricas y debug está activado, mostrar resumen
    if (metrics) {
      console.log(`[HTTP] Sesión finalizada - Tiempo activo: ${Math.round(metrics.activeTime / 1000)}s, Peticiones: ${metrics.requestCount}`);
    }

    return logoutHelper();
  },

  isAuthenticated(): boolean {
    return isAuthenticatedHelper();
  },

  async getAuthenticatedUser(): Promise<any | null> {
    return getAuthenticatedUserHelper();
  },

  getAccessToken(): string | null {
    return getAccessTokenHelper();
  },

  // Métodos internos para la implementación
  async _refreshToken(): Promise<string> {
    return refreshTokenAuthHelper();
  },

  async _handleRefreshTokenFailure(): Promise<void> {
    return handleRefreshTokenFailureAuthHelper();
  },

  _decodeToken(token: string): any {
    return decodeTokenHelper(token);
  },

  _isTokenExpired(token: string | number): boolean {
    return isTokenExpiredHelper(token);
  },

  _storeToken(key: string, value: string): void {
    storeTokenHelper(key, value);
  },

  _getToken(key: string): string | null {
    return getTokenHelper(key);
  },

  _removeToken(key: string): void {
    removeTokenHelper(key);
  },

  async initialize(config?: {
    baseUrl?: string,
    frontendUrl?: string,
    suggestionService?: { enabled: boolean, url: string },
    cache?: CacheConfig,
    metrics?: MetricsConfig,
    timeout?: number,
    retries?: number,
    headers?: Record<string, string>
  }): Promise<void> {
    // Set base URL if provided
    if (config?.baseUrl) {
      this._baseUrl = config.baseUrl;
    }

    // Store frontend URL if provided
    if (config?.frontendUrl) {
      this._frontendUrl = config.frontendUrl;
    }

    // Set global defaults if provided
    if (config?.timeout !== undefined) {
      this._defaultTimeout = config.timeout;
    }

    if (config?.retries !== undefined) {
      this._defaultRetries = config.retries;
    }

    if (config?.headers) {
      this._defaultHeaders = { ...this._defaultHeaders, ...config.headers };
    }

    // Inicializar caché si está configurado
    if (config?.cache) {
      this.configureCaching(config.cache);
    }

    // Inicializar métricas si está configurado
    if (config?.metrics) {
      this.configureMetrics(config.metrics);
    }

    return initializeHelper();
  },

  // Métodos adicionales para caché
  configureCaching(config: CacheConfig): void {
    cacheManager.configure(config);
  },

  invalidateCache(pattern: string): void {
    cacheManager.invalidate(pattern);
  },

  invalidateCacheByTags(tags: string[]): void {
    cacheManager.invalidateByTags(tags);
  },

  // Métodos para métricas
  configureMetrics(config: MetricsConfig): void {
    metricsManager.configure(config);
  },

  trackActivity(type: string): void {
    metricsManager.trackActivity(type);
  },

  getCurrentMetrics(): any {
    return metricsManager.getCurrentMetrics();
  }
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






