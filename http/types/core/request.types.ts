import { ApiResponse } from "./response.types";
import { HttpMethod } from "./http-methods.types";
import { AxiosResponse } from "axios";

/**
 * Ejecutor de peticiones HTTP
 */
export interface HttpRequestExecutor {
  /**
   * Ejecuta una petición HTTP
   * @param endpoint URL del endpoint
   * @param method Método HTTP
   * @param headers Cabeceras HTTP
   * @param body Cuerpo de la petición
   * @param signal Señal para abortar la petición
   * @returns Promesa con la respuesta Axios
   */
  executeRequest<T>(
    endpoint: string,
    method: HttpMethod,
    headers: Record<string, string>,
    body: unknown | undefined,
    signal: AbortSignal
  ): Promise<AxiosResponse<T>>;
}

/**
 * Manejador de reintentos HTTP
 */
export interface HttpRetryHandler {
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
  executeWithRetry<T>(
    endpoint: string,
    method: HttpMethod,
    headers: Record<string, string>,
    body: unknown | undefined,
    timeout: number,
    retriesLeft: number
  ): Promise<ApiResponse<T>>;

  /**
   * Maneja el reintento de una petición fallida
   * @param error Error ocurrido
   * @param retryCallback Callback para reintentar
   * @param retriesLeft Número de reintentos restantes
   * @returns Promesa con la respuesta API estandarizada
   */
  handleRetry<T>(
    error: unknown,
    retryCallback: () => Promise<ApiResponse<T>>,
    retriesLeft: number
  ): Promise<ApiResponse<T>>;

  /**
   * Determina si un error es recuperable mediante reintentos
   * @param error Error a evaluar
   * @returns true si el error es recuperable
   */
  isRetryableError(error: unknown): boolean;

  /**
   * Espera un tiempo antes de reintentar
   * @param retriesLeft Número de reintentos restantes
   */
  waitForRetry(retriesLeft: number): Promise<void>;
}
