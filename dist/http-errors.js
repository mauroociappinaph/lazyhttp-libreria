"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpAuthError = exports.HttpAbortedError = exports.HttpUnknownError = exports.HttpAxiosError = exports.HttpNetworkError = exports.HttpTimeoutError = exports.HttpError = void 0;
class HttpError extends Error {
}
exports.HttpError = HttpError;
HttpError.ERROR_MESSAGES = {
    TIMEOUT: 'La solicitud ha excedido el tiempo de espera',
    NETWORK: 'Error de conexión con el servidor',
    UNKNOWN: 'Error desconocido',
    ABORTED: 'La solicitud fue cancelada por timeout',
    SESSION_EXPIRED: 'La sesión ha expirado',
    AXIOS_ERROR: 'Error de conexión con AxiosError',
};
class HttpTimeoutError extends HttpError {
    constructor(message = HttpError.ERROR_MESSAGES.TIMEOUT) {
        super(message);
        this.name = 'HttpTimeoutError';
    }
}
exports.HttpTimeoutError = HttpTimeoutError;
class HttpNetworkError extends HttpError {
    constructor(message = HttpError.ERROR_MESSAGES.NETWORK) {
        super(message);
        this.name = 'HttpNetworkError';
    }
}
exports.HttpNetworkError = HttpNetworkError;
class HttpAxiosError extends HttpError {
    constructor(message = HttpError.ERROR_MESSAGES.AXIOS_ERROR) {
        super(message);
        this.name = 'HttpAxiosError';
    }
}
exports.HttpAxiosError = HttpAxiosError;
class HttpUnknownError extends HttpError {
    constructor(message = HttpError.ERROR_MESSAGES.UNKNOWN) {
        super(message);
        this.name = 'HttpUnknownError';
    }
}
exports.HttpUnknownError = HttpUnknownError;
class HttpAbortedError extends HttpError {
    constructor(message = HttpError.ERROR_MESSAGES.ABORTED) {
        super(message);
        this.name = 'HttpAbortedError';
    }
}
exports.HttpAbortedError = HttpAbortedError;
class HttpAuthError extends HttpError {
    constructor(message = HttpError.ERROR_MESSAGES.SESSION_EXPIRED) {
        super(message);
        this.name = 'HttpAuthError';
    }
}
exports.HttpAuthError = HttpAuthError;
