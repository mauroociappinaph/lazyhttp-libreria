import { HttpImplementation, RequestOptions, ApiResponse, AuthConfig, UserCredentials, AuthInfo, CacheConfig } from './http.types';
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

const DEFAULT_TIMEOUT = 10000; // 10 segundos
const DEFAULT_RETRIES = 0;

export const http: HttpImplementation & {
  configureCaching: (config: CacheConfig) => void;
  invalidateCache: (pattern: string) => void;
  invalidateCacheByTags: (tags: string[]) => void;
} = {
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
      // Comprobar si debemos usar la caché
      if (cacheManager.shouldUseCache(method, options)) {
        const cacheKey = cacheManager.generateCacheKey(endpoint, options);

        return await executeWithCacheStrategy<T>(
          cacheKey,
          async () => {
            const requestHeaders = prepareHeaders(headers, withAuth);
            const response = await retryHandler.executeWithRetry(
              endpoint,
              method,
              requestHeaders,
              body,
              timeout,
              retries
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
        endpoint,
        method,
        requestHeaders,
        body,
        timeout,
        retries
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
    return loginHelper(credentials);
  },

  async logout(): Promise<void> {
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
  _setupInterceptors: setupInterceptors,

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

  async initialize(config?: { suggestionService?: { enabled: boolean, url: string }, cache?: CacheConfig }): Promise<void> {
    // Inicializar caché si está configurado
    if (config?.cache) {
      this.configureCaching(config.cache);
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






