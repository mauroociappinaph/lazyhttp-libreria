import { BaseHttpClient } from '../../common/core/base-http-client';
import { HttpMethod, ApiResponse, RequestOptions, AuthInfo, UserCredentials, InitConfig } from '../../common/types';
import { HttpUtils } from '../../common/utils/http-utils';
import axios, { isAxiosError } from 'axios';
import { AuthManager } from '../managers/auth.manager';
import { CacheManager } from '../managers/cache.manager';

/**
 * Implementación del cliente HTTP para navegadores
 * Extiende la base común añadiendo funcionalidades específicas del entorno
 */
export class BrowserHttpClient extends BaseHttpClient {
  private authManager: AuthManager;
  private cacheManager: CacheManager;

  constructor(config: Partial<InitConfig>) {
    super();
    this.initialize(config);
    this.authManager = new AuthManager(this.authConfig, this);
    this.cacheManager = new CacheManager(this.cacheConfig);
  }

  /**
   * Implementación específica de request para navegador usando axios
   */
  protected async _requestWithTransforms<T>(method: HttpMethod, url: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    const fullUrl = this.buildRequestUrl(url);
    const headers = this.prepareHeaders(
      options?.headers || {},
      options?.withAuth !== undefined ? options.withAuth : false
    );
    const urlWithParams = options?.params
      ? HttpUtils.addQueryParams(fullUrl, options.params)
      : fullUrl;

    // Aplicar transformRequest
    let requestData = data;
    let transformRequestFns: ((data: unknown) => unknown)[] = [];
    if (options && options.transformRequest) {
      const tr = options.transformRequest;
      if (typeof tr === 'function') {
        transformRequestFns = [tr];
      } else if (Array.isArray(tr)) {
        transformRequestFns = tr;
      }
    } else if (this._activeTransformRequest && this._activeTransformRequest.length > 0) {
      transformRequestFns = this._activeTransformRequest;
    }
    if (transformRequestFns.length > 0) {
      for (const fn of transformRequestFns) {
        requestData = fn(requestData);
      }
    }

    try {
      const response = await axios.request<T>({
        method,
        url: urlWithParams,
        data: requestData,
        headers,
        timeout: options?.timeout || this.defaultTimeout,
      });

      // Aplicar transformResponse
      let responseData: unknown = response.data;
      let transformResponseFns: ((data: unknown) => unknown)[] = [];
      if (options && options.transformResponse) {
        const tr = options.transformResponse;
        if (typeof tr === 'function') {
          transformResponseFns = [tr];
        } else if (Array.isArray(tr)) {
          transformResponseFns = tr;
        }
      } else if (this._activeTransformResponse && this._activeTransformResponse.length > 0) {
        transformResponseFns = this._activeTransformResponse;
      }
      if (transformResponseFns.length > 0) {
        for (const fn of transformResponseFns) {
          responseData = fn(responseData);
        }
      }

      return {
        data: responseData as T,
        status: response.status,
        headers: response.headers as Record<string, string>,
        config: response.config,
      };
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        return {
          data: null as unknown as T,
          status: error.response?.status || 500,
          headers: (error.response?.headers as Record<string, string>) || {},
          error: error.response?.data?.message || error.message,
        };
      }
      // Manejar errores inesperados devolviendo ApiResponse
      return {
        data: null as unknown as T,
        status: 500,
        headers: {},
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }



  // Implementaciones específicas para navegador

  /**
   * Inicia sesión con las credenciales proporcionadas
   */
  async login(credentials: UserCredentials): Promise<AuthInfo> {
    return this.authManager.login(credentials);
  }

  /**
   * Cierra la sesión eliminando tokens
   */
  async logout(): Promise<void> {
    return this.authManager.logout();
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.authManager.isAuthenticated();
  }

  /**
   * Obtiene el usuario autenticado
   */
  getAuthenticatedUser(): unknown | null {
    return this.authManager.getAuthenticatedUser();
  }

  /**
   * Obtiene el token de acceso
   */
  getAccessToken(): string | null {
    return this.authManager.getAccessToken();
  }

  /**
   * Invalida caché por patrón
   */
  invalidateCache(pattern: string): void {
    this.cacheManager.invalidateCache(pattern);
  }

  /**
   * Invalida caché por tags
   */
  invalidateCacheByTags(tags: string[]): void {
    this.cacheManager.invalidateCacheByTags(tags);
  }

  /**
   * Registra actividad para métricas
   */
  trackActivity(type: string): void {
    if (!this.metricsConfig.enabled) return;

    // Implementación básica, almacenar en localStorage
    try {
      const metricsKey = 'http_metrics';
      const currentMetrics = this.getCurrentMetrics();

      // Actualizar métricas según el tipo
      if (type === 'request') {
        currentMetrics.requests = (currentMetrics.requests || 0) + 1;
      } else if (type === 'error') {
        currentMetrics.errors = (currentMetrics.errors || 0) + 1;
      } else if (type === 'cache_hit') {
        currentMetrics.cacheHits = (currentMetrics.cacheHits || 0) + 1;
      } else if (type === 'cache_miss') {
        currentMetrics.cacheMisses = (currentMetrics.cacheMisses || 0) + 1;
      }

      // Guardar métricas actualizadas
      localStorage.setItem(metricsKey, JSON.stringify(currentMetrics));
    } catch {
      // Ignorar errores en métricas
    }
  }

  /**
   * Obtiene las métricas actuales
   */
  getCurrentMetrics(): { requests: number; errors: number; cacheHits: number; cacheMisses: number } {
    try {
      const metricsKey = 'http_metrics';
      const metricsData = localStorage.getItem(metricsKey);

      if (metricsData) {
        return JSON.parse(metricsData);
      }
    } catch {
      // Ignorar errores
    }

    // Métricas por defecto
    return {
      requests: 0,
      errors: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }


}


