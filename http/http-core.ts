import { RequestOptions, ApiResponse } from './types/core.types';
import { retryHandler, errorHandler, prepareHeaders, responseProcessor } from './http-helpers';
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
      metricsManager.trackRequest(endpoint);
      const isFullUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://');
      const finalEndpoint = isFullUrl ? endpoint : this._baseUrl ? `${this._baseUrl}${endpoint}` : endpoint;
      const requestHeaders = prepareHeaders(headers, withAuth);

      // Capturar tiempo de inicio
      const requestStart = Date.now();
      const response = await retryHandler.executeWithRetry(
        finalEndpoint,
        method,
        requestHeaders,
        body,
        timeout || this._defaultTimeout || DEFAULT_TIMEOUT,
        retries !== undefined ? retries : this._defaultRetries !== undefined ? this._defaultRetries : DEFAULT_RETRIES,
        { requestStart }
      );

      if (method !== 'GET') {
        cacheManager.invalidateByMethod(method, endpoint);
      }

      // Si la respuesta ya tiene fullMeta, devolverla tal cual
      if (response && typeof response === 'object' && 'fullMeta' in response) {
        return response as ApiResponse<T>;
      }

      // Si la respuesta es un objeto tipo AxiosResponse (tiene config y headers), procesarla para poblar fullMeta
      if (response && typeof response === 'object' && 'config' in response && 'headers' in response) {
        return responseProcessor.processResponse(response as any, {
          requestHeaders,
          timing: { requestStart, responseEnd: Date.now() },
          rawBody: typeof response.data === 'string' ? response.data : ''
        }) as ApiResponse<T>;
      }

      // Si la respuesta es un ApiResponse plano, agregar fullMeta manualmente
      if (response && typeof response === 'object' && 'status' in response && 'data' in response) {
        return {
          ...response,
          fullMeta: {
            requestHeaders,
            responseHeaders: {},
            timing: { requestStart, responseEnd: Date.now() },
            rawBody: typeof response.data === 'string' ? response.data : '',
            errorDetails: undefined
          }
        } as ApiResponse<T>;
      }

      return response as ApiResponse<T>;
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

  /**
   * Realiza múltiples solicitudes GET concurrentes y devuelve un array con los datos de cada respuesta.
   *
   * @template T Tipo de los datos esperados en la respuesta.
   * @param {string[]} urls - Array de URLs a las que se realizará la solicitud GET concurrente.
   * @param {Omit<RequestOptions, 'method' | 'body'>} [options] - Opciones adicionales para cada solicitud (headers, params, etc). Opcional.
   * @returns {Promise<T[]>} Promesa que resuelve con un array de datos (excluyendo los nulos) en el mismo orden que las URLs.
   *
   * @example
   * const http = new HttpCore();
   * const urls = [
   *   'https://api.com/1',
   *   'https://api.com/2'
   * ];
   * const resultados = await http.all(urls);
   * // resultados = [dato1, dato2]
   *
   * // Si alguna respuesta es null, se omite del array final
   */
  async all<T = any>(urls: string[], options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T[]> {
    const promesas = urls.map(url => this.get<T>(url, options));
    const resultados = await Promise.all(promesas);
    // Filtra los null para evitar errores de tipo
    return resultados.map(r => r.data).filter((d): d is T => d !== null);
  }

  /**
   * Sube archivos y campos de formulario de manera optimizada (Node.js y browser)
   * Soporta múltiples archivos por campo (arrays)
   * Permite desactivar validación de archivos (validateFiles: false) y validar tamaño máximo (maxFileSize)
   * @param endpoint URL destino
   * @param fields Objeto con campos (puede incluir paths, streams, strings, buffers o arrays de estos)
   * @param options Opciones adicionales de la petición y validación
   */
  async upload<T = any>(
    endpoint: string,
    fields: Record<string, any>,
    options?: Omit<RequestOptions, 'method' | 'body'> & {
      validateFiles?: boolean;
      maxFileSize?: number;
    }
  ): Promise<ApiResponse<T>> {
    // Node.js
    if (typeof window === 'undefined') {
      const { buildNodeFormData } = await import('./server/utils/http-upload.utils');
      const { validateFiles, maxFileSize, ...restOptions } = options || {};
      let form, headers;
      try {
        ({ form, headers } = buildNodeFormData(fields, undefined, { validateFiles, maxFileSize }));
      } catch (err) {
        // Devuelvo el error como ApiResponse, no como excepción
        return { data: null, error: err instanceof Error ? err.message : String(err), status: 0 };
      }
      return this.post(endpoint, form, {
        ...restOptions,
        headers: { ...(restOptions.headers || {}), ...headers }
      });
    } else {
      // Browser: usar FormData nativo y soportar arrays
      const form = new FormData();
      for (const key in fields) {
        const value = fields[key];
        if (Array.isArray(value)) {
          value.forEach((item) => form.append(key, item));
        } else {
          form.append(key, value);
        }
      }
      return this.post(endpoint, form, options);
    }
  }
}
