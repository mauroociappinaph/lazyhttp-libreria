import { HttpRetryHandler } from "../../types/core/request.types";
import { ApiResponse } from "../../types/core/response.types";
import { HttpMethod } from "../../types/core/http-methods.types";
import { errorHandler } from "../error/error-handler";
import { requestExecutor } from "../request/request-executor";
import { responseProcessor } from "../response/response-processor";
import { isAxiosError } from "axios";
import { logger } from "../logging/logger";

/**
 * Implementación del manejador de reintentos HTTP
 */
export const retryHandler: HttpRetryHandler = {
  /**
   * Ejecuta una petición HTTP con reintentos automáticos
   * @param endpoint URL del endpoint
   * @param method Método HTTP
   * @param headers Cabeceras HTTP
   * @param body Cuerpo de la petición
   * @param timeout Tiempo de espera
   * @param retriesLeft Número de reintentos restantes
   * @returns Promesa con la respuesta API estandarizada
   */
  async executeWithRetry<T>(
    endpoint: string,
    method: HttpMethod,
    headers: Record<string, string>,
    body: unknown | undefined,
    timeout: number,
    retriesLeft: number
  ): Promise<ApiResponse<T>> {
    try {
      // Crear un controlador de aborto para gestionar timeouts
      const controller = new AbortController();

      // Configurar timeout
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeout);

      try {
        // Ejecutar la petición
        const response = await requestExecutor.executeRequest<T>(
          endpoint,
          method,
          headers,
          body,
          controller.signal
        );

        // Procesar la respuesta
        return responseProcessor.processResponse<T>(response);
      } finally {
        // Limpiar el timeout
        clearTimeout(timeoutId);
      }
    } catch (error) {
      // Intentar reintento si es necesario
      return this.handleRetry<T>(
        error,
        () =>
          this.executeWithRetry(
            endpoint,
            method,
            headers,
            body,
            timeout,
            retriesLeft - 1
          ),
        retriesLeft
      );
    }
  },

  /**
   * Maneja el reintento de una petición fallida
   * @param error Error ocurrido
   * @param retryCallback Callback para reintentar
   * @param retriesLeft Número de reintentos restantes
   * @returns Promesa con la respuesta API estandarizada
   */
  async handleRetry<T>(
    error: unknown,
    retryCallback: () => Promise<ApiResponse<T>>,
    retriesLeft: number
  ): Promise<ApiResponse<T>> {
    // Si quedan reintentos y el error es recuperable
    if (retriesLeft > 0 && this.isRetryableError(error)) {
      logger.warn(
        `Reintentando petición... (${retriesLeft} intentos restantes)`,
        { error }
      );
      await this.waitForRetry(retriesLeft);
      return retryCallback();
    }

    // No quedan reintentos o el error no es recuperable
    return errorHandler.handleError(error);
  },

  /**
   * Determina si un error es recuperable mediante reintentos
   * @param error Error a evaluar
   * @returns true si el error es recuperable
   */
  isRetryableError(error: unknown): boolean {
    if (isAxiosError(error)) {
      const status = error.response?.status;
      // Errores de red, timeout o códigos 5xx son recuperables
      return !error.response || !status || status >= 500;
    }
    return false;
  },

  /**
   * Espera un tiempo antes de reintentar
   * @param retriesLeft Número de reintentos restantes
   */
  async waitForRetry(retriesLeft: number): Promise<void> {
    // Espera exponencial (500ms, 1000ms, 2000ms, etc.)
    const delay = 500 * Math.pow(2, 3 - retriesLeft);
    return new Promise((resolve) => setTimeout(resolve, delay));
  },
};
