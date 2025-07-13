import { HttpMethod, ApiResponse, HttpRetryHandler } from '../http.types';
import axios, { isAxiosError } from 'axios';
import { HttpNetworkError } from '../http-errors';
import { responseProcessor } from '../http-helpers';


/**
 * Implementación del manejador de reintentos para solicitudes HTTP
 */
export const retryHandler: HttpRetryHandler = {
  async executeWithRetry<T>(
    endpoint: string,
    method: HttpMethod,
    headers: Record<string, string>,
    body: unknown | undefined,
    timeout: number,
    retriesLeft: number,
    metaOpcional?: {
      requestStart?: number;
    }
  ): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const responseStart = Date.now();
      const response = await axios.request<T>({
        url: endpoint,
        method,
        headers,
        data: body,
        signal: controller.signal
      });
      const responseEnd = Date.now();
      clearTimeout(timeoutId);

      return responseProcessor.processResponse<T>(response, {
        requestHeaders: headers,
        timing: {
          requestStart: metaOpcional?.requestStart || responseStart,
          responseEnd
        },
        rawBody: typeof response.data === 'string' ? response.data : ''
      });
    } catch (error) {
      if (retriesLeft > 0 && this.isRetryableError(error)) {
        return this.handleRetry<T>(
          error,
          () => this.executeWithRetry<T>(endpoint, method, headers, body, timeout, retriesLeft - 1, metaOpcional),
          retriesLeft
        );
      }
      throw error;
    }
  },

  async handleRetry<T>(
    _error: unknown,
    retryCallback: () => Promise<ApiResponse<T>>,
    retriesLeft: number
  ): Promise<ApiResponse<T>> {
    // Esperar un tiempo antes de reintentar (usando backoff exponencial)
    await this.waitForRetry(retriesLeft);

    // Realizar el reintento
    return retryCallback();
  },

  isRetryableError(error: unknown): boolean {
    // Errores de red son candidatos para reintento
    if (error instanceof HttpNetworkError) return true;

    // Errores de axios que indiquen problemas de red
    if (isAxiosError(error) && !error.response) return true;

    // Errores HTTP 5xx (servidor)
    if (isAxiosError(error) && error.response && error.response.status >= 500) return true;

    // Errores HTTP 429 (demasiadas peticiones)
    if (isAxiosError(error) && error.response && error.response.status === 429) return true;

    return false;
  },

  async waitForRetry(retriesLeft: number): Promise<void> {
    // Backoff exponencial: a medida que disminuyen los reintentos, aumenta el tiempo de espera
    const waitTime = Math.pow(2, 5 - retriesLeft) * 100; // 100, 200, 400, 800, 1600 ms
    return new Promise(resolve => setTimeout(resolve, waitTime));
  }
};
