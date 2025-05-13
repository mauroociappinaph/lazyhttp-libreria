import { AxiosResponse } from 'axios';

/**
 * Detalles detallados de un error
 */
export interface ErrorDetails {
  /**
   * Descripción detallada del error
   */
  description: string;

  /**
   * Causa probable del error
   */
  cause: string;

  /**
   * Pasos para resolver el error
   */
  solution: string;

  /**
   * Ejemplo de código para evitar o manejar el error
   */
  example?: string;
}

/**
 * Respuesta genérica de la API
 */
export interface ApiResponse<T> {
  /**
   * Datos de la respuesta
   */
  data: T | null;

  /**
   * Mensaje de error (si lo hay)
   */
  error: string | null;

  /**
   * Código de estado HTTP
   */
  status: number;

  /**
   * Metadatos adicionales de la respuesta
   */
  meta?: Record<string, any>;

  /**
   * Detalles adicionales del error (si lo hay)
   */
  details?: ErrorDetails;
}

/**
 * Información sobre paginación
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Respuesta API con información de paginación
 */
export interface ApiResponseWithPagination<T> extends ApiResponse<T> {
  pagination: PaginationMeta | null;
}

/**
 * Procesador de respuestas HTTP
 */
export interface HttpResponseProcessor {
  /**
   * Procesa una respuesta HTTP y la convierte en una respuesta API estandarizada
   * @param response Respuesta de Axios
   * @returns Respuesta API estandarizada
   */
  processResponse<T>(response: AxiosResponse<T>): ApiResponse<T>;
}

/**
 * Manejador de errores HTTP
 */
export interface HttpErrorHandler {
  /**
   * Maneja un error HTTP y lo convierte en una respuesta API estandarizada
   * @param error Error a manejar
   * @returns Respuesta API con información del error
   */
  handleError(error: unknown): ApiResponse<never>;
}
