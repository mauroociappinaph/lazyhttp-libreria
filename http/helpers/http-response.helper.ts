import { HttpResponseProcessor } from '../http.types';
import { AxiosResponse } from 'axios';
import { ApiResponse, FullResponseMetadata } from '../types/core/response.types';

/**
 * Implementación del procesador de respuestas HTTP
 * Se encarga de convertir respuestas de Axios al formato estándar ApiResponse
 */
export const responseProcessor: HttpResponseProcessor = {
  /**
   * Procesa una respuesta HTTP y la convierte en una respuesta API estandarizada
   * @param response Respuesta de Axios
   * @param metaOpcional Opcional: metadatos extra (headers enviados, tiempos, rawBody)
   */
  processResponse<T>(
    response: AxiosResponse<T>,
    metaOpcional?: {
      requestHeaders?: Record<string, string>;
      timing?: Record<string, number>;
      rawBody?: string | Uint8Array;
    }
  ): ApiResponse<T> {
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

    // Normalizar headers recibidos a Record<string, string>
    const normalizedResponseHeaders: Record<string, string> = {};
    Object.entries(headers).forEach(([key, value]) => {
      if (typeof value === 'string') normalizedResponseHeaders[key] = value;
      else if (Array.isArray(value)) normalizedResponseHeaders[key] = value.join(', ');
      else if (value !== undefined && value !== null) normalizedResponseHeaders[key] = String(value);
    });

    // Construir metadatos completos
    const fullMeta: FullResponseMetadata = {
      requestHeaders: metaOpcional?.requestHeaders || {},
      responseHeaders: normalizedResponseHeaders,
      timing: metaOpcional?.timing || {},
      rawBody: metaOpcional?.rawBody || '',
      errorDetails: undefined
    };

    // Construir respuesta estándar
    return {
      data: data,
      error: null,
      status: status,
      ...(Object.keys(meta).length > 0 ? { meta } : {}),
      fullMeta
    };
  }
};
