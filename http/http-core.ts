import { RequestOptions, ApiResponse } from './http.types';
import { retryHandler, errorHandler, prepareHeaders } from './http-helpers';
import { cacheManager } from './http-cache';
import { executeWithCacheStrategy } from './http-cache-strategies';
import { metricsManager } from './metrics/http-metrics-index';

const DEFAULT_TIMEOUT = 10000; // 10 segundos
const DEFAULT_RETRIES = 0;

/**
 * Implementación central del cliente HTTP con métodos de solicitud básicos
 */
export class HttpCore {
  _baseUrl?: string;
  _frontendUrl?: string;
  _defaultTimeout: number = DEFAULT_TIMEOUT;
  _defaultRetries: number = DEFAULT_RETRIES;
  _defaultHeaders: Record<string, string> = {};

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    // Normalizar endpoint
    if (!endpoint.startsWith('/') && !endpoint.startsWith('http')) {
      endpoint = `/${endpoint}`;
    }

    // Aplicar estrategia de caché si está configurada
    if (options.cache) {
      const cacheKey = cacheManager.generateCacheKey(endpoint, options);
      const result = await executeWithCacheStrategy<T>(
        cacheKey,
        async () => this.performRequest<T>(endpoint, options),
        options
      );
      return result;
    }

    // Ejecutar la solicitud normalmente
    return this.performRequest<T>(endpoint, options);
  }

  // Método privado para realizar la solicitud HTTP real
  private async performRequest<T>(endpoint: string, options: RequestOptions): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      withAuth = false,
      timeout = DEFAULT_TIMEOUT,
      retries = DEFAULT_RETRIES
    } = options;

    try {
      // Registrar la petición en métricas
      metricsManager.trackRequest(endpoint);

      // Determinar si la URL es completa o si debemos usar baseUrl
      const isFullUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://');
      const finalEndpoint = isFullUrl ? endpoint : this._baseUrl ? `${this._baseUrl}${endpoint}` : endpoint;

      // Petición sin caché
      const requestHeaders = prepareHeaders(headers, withAuth);
      const response = await retryHandler.executeWithRetry(
        finalEndpoint,
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
  }

  // Métodos HTTP simplificados
  async get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

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
  }

  async getById<T>(endpoint: string, id: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET', params: { id } });
  }

  async post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}
