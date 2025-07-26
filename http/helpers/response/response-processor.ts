import { AxiosResponse } from "axios";
import {
  ApiResponse,
  HttpResponseProcessor,
} from "../../types/core/response.types";
import { logResponse } from "../logging/logger";

/**
 * Implementación del procesador de respuestas HTTP
 */
export const responseProcessor: HttpResponseProcessor = {
  /**
   * Procesa una respuesta HTTP y la transforma en una respuesta API estandarizada
   * @param response Respuesta de Axios
   * @returns Respuesta API estandarizada
   */
  processResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    logResponse({
      ...response,
      config: {
        ...response.config,
        url: response.config.url ?? "",
      },
    });

    // Extraer datos y preparar respuesta estandarizada
    const apiResponse: ApiResponse<T> = {
      data: response.data,
      error: null,
      status: response.status,
      meta: {
        headers: response.headers,
        url: response.config.url,
        method: response.config.method?.toUpperCase(),
      },
    };

    return apiResponse;
  },
};
