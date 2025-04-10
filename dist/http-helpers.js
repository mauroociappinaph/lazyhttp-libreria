"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports._handleRefreshTokenFailure = exports._refreshToken = exports._setupInterceptors = exports._logResponse = exports._logRequest = exports._prepareHeaders = exports._waitForRetry = exports._isRetryableError = exports._handleRetry = exports._executeWithRetry = exports._processResponse = exports._executeRequest = exports._handleError = exports.retryHandler = exports.responseProcessor = exports.requestExecutor = exports.errorHandler = exports.logger = void 0;
exports.logRequest = logRequest;
exports.logResponse = logResponse;
exports.prepareHeaders = prepareHeaders;
exports.setupInterceptors = setupInterceptors;
exports.refreshToken = refreshToken;
exports.handleRefreshTokenFailure = handleRefreshTokenFailure;
exports.initialize = initialize;
const axios_1 = __importStar(require("axios"));
const http_errors_1 = require("./http-errors");
const http_config_1 = require("./http-config");
// ===== Sistema de logging avanzado =====
exports.logger = {
    /**
     * Registra un mensaje con nivel de error
     * @param message Mensaje principal
     * @param data Datos adicionales para incluir en el log
     */
    error(message, data) {
        if (http_config_1.debugConfig.level >= http_config_1.DebugLevel.ERROR) {
            this._log('error', message, data);
        }
    },
    /**
     * Registra un mensaje con nivel de advertencia
     * @param message Mensaje principal
     * @param data Datos adicionales para incluir en el log
     */
    warn(message, data) {
        if (http_config_1.debugConfig.level >= http_config_1.DebugLevel.WARNING) {
            this._log('warning', message, data);
        }
    },
    /**
     * Registra un mensaje con nivel de información
     * @param message Mensaje principal
     * @param data Datos adicionales para incluir en el log
     */
    info(message, data) {
        if (http_config_1.debugConfig.level >= http_config_1.DebugLevel.INFO) {
            this._log('info', message, data);
        }
    },
    /**
     * Registra un mensaje con nivel de depuración
     * @param message Mensaje principal
     * @param data Datos adicionales para incluir en el log
     */
    debug(message, data) {
        if (http_config_1.debugConfig.level >= http_config_1.DebugLevel.DEBUG) {
            this._log('debug', message, data);
        }
    },
    /**
     * Método interno para registrar mensajes con formato
     */
    _log(level, message, data) {
        const colorStyle = `color: ${http_config_1.debugConfig.colors[level] || http_config_1.debugConfig.colors.default}; font-weight: bold;`;
        // Formatear el mensaje
        const timestamp = new Date().toISOString();
        const prefix = `[HTTP:${level.toUpperCase()}] [${timestamp}]`;
        // Log básico siempre visible
        console.group(`%c${prefix} ${message}`, colorStyle);
        // Log de datos adicionales
        if (data !== undefined) {
            if (http_config_1.debugConfig.prettyPrintJSON && typeof data === 'object') {
                console.log('%cDatos:', 'font-weight: bold');
                console.dir(data, { depth: null, colors: true });
            }
            else {
                console.log('%cDatos:', 'font-weight: bold', data);
            }
        }
        console.groupEnd();
    }
};
// ===== Implementación de HttpErrorHandler =====
exports.errorHandler = {
    handleError(error) {
        var _a, _b, _c;
        // 1. Errores de timeout (más específico primero)
        if (error instanceof http_errors_1.HttpTimeoutError) {
            exports.logger.error('Error de timeout', error);
            return {
                data: null,
                error: http_errors_1.HttpTimeoutError.ERROR_MESSAGES.TIMEOUT,
                status: 408,
            };
        }
        // 2. Errores de Axios
        if ((0, axios_1.isAxiosError)(error)) {
            exports.logger.error('Error de Axios', {
                status: (_a = error.response) === null || _a === void 0 ? void 0 : _a.status,
                message: http_errors_1.HttpAxiosError.ERROR_MESSAGES.AXIOS_ERROR,
                response: (_b = error.response) === null || _b === void 0 ? void 0 : _b.data
            });
            return {
                data: null,
                error: http_errors_1.HttpAxiosError.ERROR_MESSAGES.AXIOS_ERROR,
                status: ((_c = error.response) === null || _c === void 0 ? void 0 : _c.status) || 0,
            };
        }
        if (error instanceof http_errors_1.HttpAbortedError) {
            exports.logger.warn('Petición abortada', error);
            return {
                data: null,
                error: http_errors_1.HttpAbortedError.ERROR_MESSAGES.ABORTED,
                status: 0,
            };
        }
        // 3. Errores personalizados de sesión (ej: token expirado)
        if (error instanceof Error && error.message === 'TokenExpired') {
            exports.logger.warn('Token expirado', error);
            return {
                data: null,
                error: http_errors_1.HttpAuthError.ERROR_MESSAGES.SESSION_EXPIRED,
                status: 401,
            };
        }
        // 4. Errores genéricos
        if (error instanceof Error) {
            exports.logger.error('Error genérico', error);
            return {
                data: null,
                error: error.message || http_errors_1.HttpNetworkError.ERROR_MESSAGES.NETWORK,
                status: 0,
            };
        }
        // 5. Último recurso: error desconocido
        exports.logger.error('Error desconocido', error);
        return {
            data: null,
            error: http_errors_1.HttpUnknownError.ERROR_MESSAGES.UNKNOWN,
            status: 0,
        };
    }
};
// ===== Implementación de utilidades de logging =====
function logRequest(method, url, headers, body) {
    if (!http_config_1.debugConfig.logRequests || http_config_1.debugConfig.level < http_config_1.DebugLevel.INFO)
        return;
    // Ocultar tokens y datos sensibles
    const safeHeaders = { ...headers };
    if (safeHeaders.Authorization) {
        safeHeaders.Authorization = safeHeaders.Authorization.replace(/Bearer .+/, 'Bearer [REDACTED]');
    }
    exports.logger.info(`${method} ${url}`, {
        headers: safeHeaders,
        body: body && http_config_1.debugConfig.prettyPrintJSON ? JSON.parse(JSON.stringify(body)) : body
    });
}
function logResponse(response) {
    if (!http_config_1.debugConfig.logResponses)
        return;
    const level = response.status >= 400 ? 'error' : 'info';
    const logFn = level === 'error' ? exports.logger.error.bind(exports.logger) : exports.logger.info.bind(exports.logger);
    logFn(`Respuesta ${response.status} ${response.config.url}`, {
        status: response.status,
        headers: response.headers,
        data: response.data
    });
}
// ===== Utilidades de autenticación =====
function prepareHeaders(headers, withAuth) {
    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...headers,
    };
    if (withAuth) {
        const token = localStorage.getItem('token');
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }
    }
    return defaultHeaders;
}
// ===== Implementación de HttpRequestExecutor =====
exports.requestExecutor = {
    async executeRequest(endpoint, method, headers, body, signal) {
        const url = `${http_config_1.API_URL}${endpoint}`;
        logRequest(method, url, headers, body);
        return (0, axios_1.default)({
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
exports.responseProcessor = {
    processResponse(response) {
        logResponse(response);
        if (response.status >= 400) {
            const errorData = response.data;
            return {
                data: null,
                error: (errorData === null || errorData === void 0 ? void 0 : errorData.message) || response.statusText,
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
exports.retryHandler = {
    async executeWithRetry(endpoint, method, headers, body, timeout, retriesLeft) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await exports.requestExecutor.executeRequest(endpoint, method, headers, body, controller.signal);
            clearTimeout(timeoutId);
            return exports.responseProcessor.processResponse(response);
        }
        catch (error) {
            clearTimeout(timeoutId);
            return this.handleRetry(error, () => this.executeWithRetry(endpoint, method, headers, body, timeout, retriesLeft - 1), retriesLeft);
        }
    },
    async handleRetry(error, retryCallback, retriesLeft) {
        if (this.isRetryableError(error) && retriesLeft > 0) {
            await this.waitForRetry(retriesLeft);
            return retryCallback();
        }
        throw error;
    },
    isRetryableError(error) {
        if (axios_1.default.isAxiosError(error)) {
            return !error.response || error.response.status >= 500;
        }
        return false;
    },
    async waitForRetry(retriesLeft) {
        const delay = 1000 * Math.pow(2, 3 - retriesLeft);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
};
// ===== Métodos de autenticación =====
function setupInterceptors() {
    // Implementación inicial vacía
}
async function refreshToken() {
    // Implementación básica
    return Promise.resolve('');
}
async function handleRefreshTokenFailure() {
    // Implementación básica
    return Promise.resolve();
}
async function initialize() {
    setupInterceptors();
    return Promise.resolve();
}
// ===== Funciones con nombres compatibles hacia atrás para evitar refactorización extensa =====
exports._handleError = exports.errorHandler.handleError;
exports._executeRequest = exports.requestExecutor.executeRequest;
exports._processResponse = exports.responseProcessor.processResponse;
exports._executeWithRetry = exports.retryHandler.executeWithRetry.bind(exports.retryHandler);
exports._handleRetry = exports.retryHandler.handleRetry.bind(exports.retryHandler);
exports._isRetryableError = exports.retryHandler.isRetryableError;
exports._waitForRetry = exports.retryHandler.waitForRetry;
exports._prepareHeaders = prepareHeaders;
exports._logRequest = logRequest;
exports._logResponse = logResponse;
exports._setupInterceptors = setupInterceptors;
exports._refreshToken = refreshToken;
exports._handleRefreshTokenFailure = handleRefreshTokenFailure;
