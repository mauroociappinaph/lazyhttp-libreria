import { HttpResponseProcessor, ApiResponse } from '../http.types';
import { AxiosResponse } from 'axios';

/**
 * Implementación del procesador de respuestas HTTP
 * Se encarga de convertir respuestas de Axios al formato estándar ApiResponse
 */
export const responseProcessor: HttpResponseProcessor = {
  processResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    // Extraer datos y metadatos de la respuesta
    const { data, status, headers } = response;

    // Detectar si hay metadatos de paginación en los headers
    const meta: Record<string, any> = {};

    if (headers['x-total-count']) {
      meta.totalItems = parseInt(headers['x-total-count'], 10);
    }

    if (headers['x-page']) {
      meta.currentPage = parseInt(headers['x-page'], 10);
    }

    if (headers['x-per-page']) {
      meta.perPage = parseInt(headers['x-per-page'], 10);
    }

    if (headers['x-total-pages']) {
      meta.totalPages = parseInt(headers['x-total-pages'], 10);
    }

    // Construir respuesta estándar
    return {
      data: data,
      error: null,
      status: status,
      ...(Object.keys(meta).length > 0 ? { meta } : {})
    };
  }
};
