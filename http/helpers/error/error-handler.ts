import { ApiResponse, HttpErrorHandler } from '../../http.types';
import { isAxiosError } from 'axios';
import {
  HttpTimeoutError,
  HttpAxiosError,
  HttpAbortedError,
  HttpAuthError,
  HttpNetworkError,
  HttpUnknownError,
  HttpError
} from '../../http-errors';
import { httpLogger } from '../../http-logger';

/**
 * Implementación del manejador de errores HTTP
 */
export const errorHandler: HttpErrorHandler = {
  /**
   * Maneja los errores HTTP y los transforma en respuestas API estandarizadas
   * @param error Error a manejar
   * @returns Respuesta API con detalles del error
   */
  handleError(error: unknown): ApiResponse<never> {
    let response: ApiResponse<never>;

    // 1. Errores de timeout (más específico primero)
    if (error instanceof HttpTimeoutError) {
      response = {
        data: null,
        error: error.details?.description || HttpTimeoutError.ERROR_MESSAGES.TIMEOUT,
        status: 408,
        details: error.details
      };
    }
    // 2. Errores de Axios
    else if (isAxiosError(error)) {
      const axiosError = new HttpAxiosError();
      response = {
        data: null,
        error: axiosError.details?.description || HttpAxiosError.ERROR_MESSAGES.AXIOS_ERROR,
        status: error.response?.status || 0,
        details: axiosError.details
      };
    }
    // 3. Errores de aborto
    else if (error instanceof HttpAbortedError) {
      response = {
        data: null,
        error: error.details?.description || HttpAbortedError.ERROR_MESSAGES.ABORTED,
        status: 0,
        details: error.details
      };
    }
    // 4. Errores de autenticación
    else if (error instanceof Error && error.message === 'TokenExpired') {
      const authError = new HttpAuthError();
      response = {
        data: null,
        error: authError.details?.description || HttpAuthError.ERROR_MESSAGES.SESSION_EXPIRED,
        status: 401,
        details: authError.details
      };
    }
    // 5. Errores genéricos
    else if (error instanceof Error) {
      response = {
        data: null,
        error: error.message || HttpNetworkError.ERROR_MESSAGES.NETWORK,
        status: 0,
        details: (error as HttpError).details
      };
    }
    // 6. Último recurso: error desconocido
    else {
      const unknownError = new HttpUnknownError();
      response = {
        data: null,
        error: unknownError.details?.description || HttpUnknownError.ERROR_MESSAGES.UNKNOWN,
        status: 0,
        details: unknownError.details
      };
    }

    // Log automático del error
    httpLogger.logError(response);
    return response;
  }
};
