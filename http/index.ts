/**
 * httplazy - Biblioteca HTTP declarativa y modular
 *
 * Esta biblioteca proporciona una forma declarativa y minimalista de consumir APIs,
 * con soporte para autenticación, manejo de errores y reintentos automáticos.
 */

// Tipos principales
import * as HttpTypes from './types';
export { HttpTypes };

// Funcionalidades principales
import * as HttpCore from './http-core';
import * as HttpAuth from './http-auth';
import * as HttpCache from './http-cache';
import * as HttpInterceptors from './http-interceptors';
import * as HttpStreaming from './http-streaming';
import * as HttpErrors from './http-errors';
import * as HttpCookies from './http-cookies';
import * as HttpConfig from './http-config';

// Exportar módulos con namespace para evitar colisiones
export { HttpCore, HttpAuth, HttpCache, HttpInterceptors, HttpStreaming, HttpErrors, HttpCookies, HttpConfig };

// Exportar utilidades específicas de helpers
export {
  logger,
  logRequest,
  logResponse,
  errorHandler,
  requestExecutor,
  responseProcessor,
  retryHandler,
  buildUrl,
  addQueryParams,
  normalizePath,
  joinPaths
} from './helpers';

export * from './utils';
