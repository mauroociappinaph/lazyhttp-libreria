// http/client/managers/http-operations-manager.ts

import { HttpCore } from '../../http-core';
import { RequestOptions, ApiResponse } from '../../http.types';
import { streamingManager } from '../../http-streaming';

export class HttpOperationsManager {
  constructor(private core: HttpCore) {}

  private ensureFullMeta<T>(response: ApiResponse<T>, context: { endpoint: string, method: string, options?: any }) : ApiResponse<T> {
    if (response && typeof response === 'object' && 'fullMeta' in response && response.fullMeta) {
      return response;
    }
    // Si no existe, agregar un fullMeta mínimo
    let errorDetails: unknown = undefined;
    if (response && typeof response.error === 'object' && response.error !== null && 'details' in response.error) {
      errorDetails = (response.error as { details?: unknown }).details;
    }
    return {
      ...response,
      fullMeta: {
        requestHeaders: context.options?.headers || ({} as Record<string, string>),
        responseHeaders: (response && typeof response === 'object' && 'headers' in response && response.headers)
          ? (response.headers as Record<string, string>)
          : ({} as Record<string, string>),
        timing: { requestStart: Date.now(), responseEnd: Date.now() },
        rawBody: typeof response.data === 'string' ? response.data : '',
        errorDetails
      }
    };
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const resp = await this.core.request<T>(endpoint, options);
    return this.ensureFullMeta(resp, { endpoint, method: options.method || 'GET', options });
  }

  async get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    const resp = await this.core.get<T>(endpoint, options);
    return this.ensureFullMeta(resp, { endpoint, method: 'GET', options });
  }

  async getAll<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    const resp = await this.core.getAll<T>(endpoint, options);
    return this.ensureFullMeta(resp, { endpoint, method: 'GET', options });
  }

  async getById<T>(endpoint: string, id: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    const resp = await this.core.getById<T>(endpoint, id, options);
    return this.ensureFullMeta(resp, { endpoint, method: 'GET', options });
  }

  async post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    const resp = await this.core.post<T>(endpoint, body, options);
    return this.ensureFullMeta(resp, { endpoint, method: 'POST', options });
  }

  async put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    const resp = await this.core.put<T>(endpoint, body, options);
    return this.ensureFullMeta(resp, { endpoint, method: 'PUT', options });
  }

  async patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    const resp = await this.core.patch<T>(endpoint, body, options);
    return this.ensureFullMeta(resp, { endpoint, method: 'PATCH', options });
  }

  async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    const resp = await this.core.delete<T>(endpoint, options);
    return this.ensureFullMeta(resp, { endpoint, method: 'DELETE', options });
  }

  async stream(endpoint: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ReadableStream<unknown>> {
    return streamingManager.stream(endpoint, options);
  }
}
