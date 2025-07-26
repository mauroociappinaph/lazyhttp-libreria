import axios, { isAxiosError } from 'axios';
import { BaseHttpClient } from '../../common/core/base-http-client';
import { HttpUtils } from '../../common/utils/http-utils';
import { ServiceFactory, type ServiceContainer } from '../../services/index';
import { ApiResponse, AuthInfo, HttpMethod, InitConfig, RequestOptions, UserCredentials } from '../../types/core.types';
import { AuthManager } from '../managers/auth.manager';
import { httpCacheManager } from '../managers/http-cache-manager';

/**
 * Implementación del cliente HTTP para navegadores
 * Extiende la base común añadiendo funcionalidades específicas del entorno
 */
export class BrowserHttpClient extends BaseHttpClient {
  private authManager: AuthManager;
  private services: ServiceContainer;


  constructor(config: Partial<InitConfig>) {
    super();
    // Normalizar config para cumplir con los tipos requeridos por initialize
    const safeConfig = {
      ...config,
      cache: {
        enabled: config.cache?.enabled ?? false,
        defaultStrategy: config.cache?.defaultStrategy,
        defaultTTL: config.cache?.defaultTTL,
        storage: config.cache?.storage,
        maxSize: config.cache?.maxSize,
      },
      // Puedes agregar aquí otras normalizaciones si tu initialize lo requiere
    };
    this.initialize(safeConfig);
    this.authManager = new AuthManager(this.authConfig, this);

    // Inicializar servicios centralizados
    this.services = ServiceFactory.createBrowserServices(
      this.authManager,
      httpCacheManager,
      this.metricsConfig
    );
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
        fullMeta: { responseHeaders: response.headers as Record<string, string> },
        error: null,
      };
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        return {
          data: null as unknown as T,
          status: error.response?.status || 500,
          fullMeta: { responseHeaders: (error.response?.headers as Record<string, string>) || {} },
          error: error.response?.data?.message || error.message,
        };
      }
      // Manejar errores inesperados devolviendo ApiResponse
      return {
        data: null as unknown as T,
        status: 500,
        fullMeta: { responseHeaders: {} },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }



  // Implementaciones específicas para navegador

  // ========================================
  // Métodos delegados a servicios centralizados
  // ========================================

  /**
   * Inicia sesión con las credenciales proporcionadas
   */
  async login(credentials: UserCredentials): Promise<AuthInfo> {
    return this.services.authService.login(credentials);
  }

  /**
   * Cierra la sesión eliminando tokens
   */
  async logout(): Promise<void> {
    return this.services.authService.logout();
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.services.authService.isAuthenticated();
  }

  /**
   * Obtiene el usuario autenticado
   */
  async getAuthenticatedUser(): Promise<AuthInfo | null> {
    return this.services.authService.getAuthenticatedUser();
  }

  /**
   * Obtiene el token de acceso
   */
  getAccessToken(): string | null {
    return this.services.authService.getAccessToken();
  }

  /**
   * Invalida caché por patrón
   */
  invalidateCache(pattern: string): void {
    this.services.cacheService.invalidateCache(pattern);
  }

  /**
   * Invalida caché por tags
   */
  invalidateCacheByTags(tags: string[]): void {
    this.services.cacheService.invalidateCacheByTags(tags);
  }

  /**
   * Registra actividad para métricas
   */
  trackActivity(type: string): void {
    this.services.metricsService.trackActivity(type);
  }

  /**
   * Obtiene las métricas actuales
   */
  getCurrentMetrics(): { requests: number; errors: number; cacheHits: number; cacheMisses: number } {
    return this.services.metricsService.getCurrentMetrics();
  }
}


