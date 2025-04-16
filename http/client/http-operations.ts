import { RequestOptions, ApiResponse } from '../http.types';
import { ReadableStream } from 'stream/web';

/**
 * HttpOperations - Interfaz para todas las operaciones HTTP
 * Siguiendo el principio de segregación de interfaces (ISP) para separar
 * las operaciones HTTP de otras responsabilidades.
 */
export interface HttpOperations {
  /**
   * Realiza una petición HTTP genérica
   */
  request<T>(endpoint: string, options: RequestOptions): Promise<ApiResponse<T>>;

  /**
   * Realiza una petición GET
   */
  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;

  /**
   * Obtiene una colección de recursos
   */
  getAll<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;

  /**
   * Obtiene un recurso por su ID
   */
  getById<T>(endpoint: string, id: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;

  /**
   * Realiza una petición POST
   */
  post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;

  /**
   * Realiza una petición PUT
   */
  put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;

  /**
   * Realiza una petición PATCH
   */
  patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;

  /**
   * Realiza una petición DELETE
   */
  delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>>;

  /**
   * Realiza una petición en streaming
   */
  stream<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<any>;
}
