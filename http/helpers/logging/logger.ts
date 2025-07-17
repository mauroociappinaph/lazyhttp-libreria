import { DebugLevel, debugConfig } from '../../http-config';

/**
 * Sistema de logging avanzado para la biblioteca httplazy
 */
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

/**
 * Funciones de logging específicas para peticiones HTTP
 */
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

export interface HttpResponseLog {
  status: number;
  config: { url: string };
  headers: Record<string, unknown>;
  data: unknown;
}

export function logResponse(response: HttpResponseLog): void {
  if (!debugConfig.logResponses) return;

  const level = response.status >= 400 ? 'error' : 'info';
  const logFn = level === 'error' ? logger.error.bind(logger) : logger.info.bind(logger);

  logFn(`Respuesta ${response.status} ${response.config.url}`, {
    status: response.status,
    headers: response.headers,
    data: response.data
  });
}
