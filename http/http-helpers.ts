import {  ApiResponse, HttpMethod } from './types/core.types';
import axios, { isAxiosError, AxiosResponse } from 'axios';
import { HttpNetworkError, HttpUnknownError, HttpAbortedError, HttpAuthError, HttpTimeoutError, HttpAxiosError, HttpError } from './http-errors';
import { API_URL, DebugLevel, debugConfig } from './http-config';
import { httpLogger } from './http-logger';
import { HttpResponseProcessor, HttpRequestExecutor, HttpRetryHandler, HttpErrorHandler } from './types/internals.types';
import { ErrorResponse } from './types/error.types';

// ===== Sistema de logging avanzado =====
export const logger = {
  /**
   * Registra un mensaje con nivel de error
   * @param message Mensaje principal
   * @param data Datos adicionales para incluir en el log
   */
  error(message: string, data?: unknown): void {
    if (debugConfig.level >= DebugLevel.ERROR) {
      this._log('error', message, data);
    }
  },

  /**
   * Registra un mensaje con nivel de advertencia
   * @param message Mensaje principal
   * @param data Datos adicionales para incluir en el log
   */
  warn(message: string, data?: unknown): void {
    if (debugConfig.level >= DebugLevel.WARNING) {
      this._log('warning', message, data);
    }
  },

  /**
   * Registra un mensaje con nivel de información
   * @param message Mensaje principal
   * @param data Datos adicionales para incluir en el log
   */
  info(message: string, data?: unknown): void {
    if (debugConfig.level >= DebugLevel.INFO) {
      this._log('info', message, data);
    }
  },

  /**
   * Registra un mensaje con nivel de depuración
   * @param message Mensaje principal
   * @param data Datos adicionales para incluir en el log
   */
  debug(message: string, data?: unknown): void {
    if (debugConfig.level >= DebugLevel.DEBUG) {
      this._log('debug', message, data);
    }
  },

  /**
   * Método interno para registrar mensajes con formato
   */
  _log(level: 'error' | 'warning' | 'info' | 'debug', message: string, data?: unknown): void {
    const colorStyle = `color: ${debugConfig.colors[level] || debugConfig.colors.default}; font-weight: bold;`;

    // Formatear el mensaje
    const timestamp = new Date().toISOString();
    const prefix = `[HTTP:${level.toUpperCase()}] [${timestamp}]`;

    // Log básico siempre visible
    console.group(`%c${prefix} ${message}`, colorStyle);

    // Log de datos adicionales
    if (data !== undefined) {
      if (debugConfig.prettyPrintJSON && typeof data === 'object') {
        console.log('%cDatos:', 'font-weight: bold');
        console.dir(data, { depth: null, colors: true });
      } else {
        console.log('%cDatos:', 'font-weight: bold', data);
      }
    }

    console.groupEnd();
  }
};

// ===== Implementación de HttpErrorHandler =====
export const errorHandler: HttpErrorHandler = {
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

// ===== Implementación de utilidades de logging =====
export function logRequest(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: unknown
): void {
  if (!debugConfig.logRequests || debugConfig.level < DebugLevel.INFO) return;

  // Ocultar tokens y datos sensibles
  const safeHeaders = { ...headers };
  if (safeHeaders.Authorization) {
    safeHeaders.Authorization = safeHeaders.Authorization.replace(/Bearer .+/, 'Bearer [REDACTED]');
  }

  logger.info(`${method} ${url}`, {
    headers: safeHeaders,
    body: body && debugConfig.prettyPrintJSON ? JSON.parse(JSON.stringify(body)) : body
  });
}

export function logResponse(response: AxiosResponse): void {
  if (!debugConfig.logResponses) return;

  const level = response.status >= 400 ? 'error' : 'info';
  const logFn = level === 'error' ? logger.error.bind(logger) : logger.info.bind(logger);

  logFn(`Respuesta ${response.status} ${response.config.url}`, {
    status: response.status,
    headers: response.headers,
    data: response.data
  });
}

// ===== Utilidades de autenticación =====
export function prepareHeaders(headers: Record<string, string>, withAuth: boolean): Record<string, string> {
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (withAuth) {
    try {
      // Intentar importar dinámicamente para evitar dependencias circulares
      const auth = require('./http-auth');
      const token = auth.getAccessToken();

      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      // Fallback al comportamiento anterior
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          defaultHeaders['Authorization'] = `Bearer ${token}`;
        }
      }
    }
  }

  return defaultHeaders;
}

// ===== Implementación de HttpRequestExecutor =====
export const requestExecutor: HttpRequestExecutor = {
  async executeRequest<T>(
    endpoint: string,
    method: HttpMethod,
    headers: Record<string, string>,
    body: unknown | undefined,
    signal: AbortSignal
  ): Promise<AxiosResponse<T>> {
    // Comprobar si el endpoint ya es una URL completa
    const isFullUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://');

    // Usar el endpoint directamente si es una URL completa, o añadir API_URL si es una ruta relativa
    const url = isFullUrl ? endpoint : `${API_URL}${endpoint}`;

    logRequest(method, url, headers, body);

    return axios({
      url,
      method,
      headers,
      data: body,
      withCredentials: true,
      signal,
    });
  }
};

// ===== Implementación de HttpResponseProcessor =====
export const responseProcessor: HttpResponseProcessor = {
  processResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    logResponse(response);

    if (response.status >= 400) {
      const errorData = response.data as ErrorResponse;
      return {
        data: null,
        error: errorData?.message || response.statusText,
        status: response.status,
      };
    }

    return {
      data: response.data,
      error: null,
      status: response.status,
    };
  }
};

// ===== Implementación de HttpRetryHandler =====
export const retryHandler: HttpRetryHandler = {
  async executeWithRetry<T>(
    endpoint: string,
    method: HttpMethod,
    headers: Record<string, string>,
    body: unknown | undefined,
    timeout: number,
    retriesLeft: number
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await requestExecutor.executeRequest<T>(
        endpoint,
        method,
        headers,
        body,
        controller.signal
      );

      clearTimeout(timeoutId);
      return responseProcessor.processResponse(response);
    } catch (error) {
      clearTimeout(timeoutId);
      return this.handleRetry<T>(
        error,
        () => this.executeWithRetry<T>(
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

  async handleRetry<T>(
    error: unknown,
    retryCallback: () => Promise<ApiResponse<T>>,
    retriesLeft: number
  ): Promise<ApiResponse<T>> {
    if (this.isRetryableError(error) && retriesLeft > 0) {
      await this.waitForRetry(retriesLeft);
      return retryCallback();
    }
    throw error;
  },

  isRetryableError(error: unknown): boolean {
    if (axios.isAxiosError(error)) {
      return !error.response || error.response.status >= 500;
    }
    return false;
  },

  async waitForRetry(retriesLeft: number): Promise<void> {
    const delay = 1000 * Math.pow(2, 3 - retriesLeft);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
};

// ===== Métodos de autenticación =====
export function setupInterceptors(): void {
  // Importar axios explícitamente para configurar los interceptores
  const axios = require('axios').default;

  // Interceptor para solicitudes
  axios.interceptors.request.use(
    (config: any) => {
      // No hacer nada, el token se agregará en prepareHeaders
      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );

  // Interceptor para respuestas
  axios.interceptors.response.use(
    (response: any) => {
      return response;
    },
    async (error: any) => {
      // Si el error es de autenticación (401)
      if (error.response && error.response.status === 401) {
        try {
          // Intentar refrescar el token
          const auth = require('./http-auth');

          // Verificar si hay token de refresco y si el sistema está configurado
          if (auth.authState.refreshToken && auth.currentAuthConfig.endpoints.refresh) {
            try {
              // Intentar refrescar el token
              const newToken = await auth.refreshToken();

              // Si se obtuvo un nuevo token, reintentar la solicitud original
              if (newToken) {
                const originalRequest = error.config;
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return axios(originalRequest);
              }
            } catch (refreshError) {
              // Si falla el refresco, manejar el error
              await auth.handleRefreshTokenFailure();
            }
          } else {
            // No hay token de refresco, manejar el error
            await auth.handleRefreshTokenFailure();
          }
        } catch (authError) {
          console.warn('Error al manejar token expirado', authError);
        }
      }

      return Promise.reject(error);
    }
  );
}

export async function refreshToken(): Promise<string> {
  // Implementación básica
  return Promise.resolve('');
}

export async function handleRefreshTokenFailure(): Promise<void> {
  // Implementación básica
  return Promise.resolve();
}

export async function initialize(): Promise<void> {
  // Configurar interceptores para tokens
  setupInterceptors();

  // Cargar configuración de autenticación desde localStorage si existe
  if (typeof window !== 'undefined') {
    try {
      const savedConfig = localStorage.getItem('auth_config');
      if (savedConfig) {
        const auth = require('./http-auth');
        const parsedConfig = JSON.parse(savedConfig);
        auth.configureAuth(parsedConfig);
      }
    } catch (error) {
      console.warn('Error al cargar configuración de autenticación', error);
    }
  }

  return Promise.resolve();
}

// ===== Funciones con nombres compatibles hacia atrás para evitar refactorización extensa =====
export const _handleError = errorHandler.handleError;
export const _executeRequest = requestExecutor.executeRequest;
export const _processResponse = responseProcessor.processResponse;
export const _executeWithRetry = retryHandler.executeWithRetry.bind(retryHandler);
export const _handleRetry = retryHandler.handleRetry.bind(retryHandler);
export const _isRetryableError = retryHandler.isRetryableError;
export const _waitForRetry = retryHandler.waitForRetry;
export const _prepareHeaders = prepareHeaders;
export const _logRequest = logRequest;
export const _logResponse = logResponse;
export const _setupInterceptors = setupInterceptors;
export const _refreshToken = refreshToken;
export const _handleRefreshTokenFailure = handleRefreshTokenFailure;

