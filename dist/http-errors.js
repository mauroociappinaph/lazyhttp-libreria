"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpAuthError = exports.HttpAbortedError = exports.HttpUnknownError = exports.HttpAxiosError = exports.HttpNetworkError = exports.HttpTimeoutError = exports.HttpError = void 0;
const suggestion_service_IA_1 = require("./suggestion-service-IA");
// Create the suggestion service instance
const suggestionService = new suggestion_service_IA_1.SuggestionService();
class HttpError extends Error {
    // Método para obtener sugerencia avanzada
    static async getSmartSuggestion(error, request) {
        return await suggestionService.getSuggestion(error, request);
    }
    // Proporcionar feedback sobre una sugerencia
    static async provideSuggestionFeedback(error, request, suggestion, wasHelpful) {
        await suggestionService.provideFeedback(error, request, suggestion, wasHelpful);
    }
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
        this.suggestion = 'Verifica tu conexión a internet y vuelve a intentarlo';
    }
}
exports.HttpTimeoutError = HttpTimeoutError;
class HttpNetworkError extends HttpError {
    constructor(message = HttpError.ERROR_MESSAGES.NETWORK) {
        super(message);
        this.name = 'HttpNetworkError';
        this.suggestion = 'Verifica tu conexión a internet y vuelve a intentarlo';
    }
}
exports.HttpNetworkError = HttpNetworkError;
class HttpAxiosError extends HttpError {
    constructor(message = HttpError.ERROR_MESSAGES.AXIOS_ERROR) {
        super(message);
        this.name = 'HttpAxiosError';
        this.suggestion = 'Verifica tu conexión a internet y vuelve a intentarlo';
    }
}
exports.HttpAxiosError = HttpAxiosError;
class HttpUnknownError extends HttpError {
    constructor(message = HttpError.ERROR_MESSAGES.UNKNOWN) {
        super(message);
        this.name = 'HttpUnknownError';
        this.suggestion = 'Verifica tu conexión a internet y vuelve a intentarlo';
    }
}
exports.HttpUnknownError = HttpUnknownError;
class HttpAbortedError extends HttpError {
    constructor(message = HttpError.ERROR_MESSAGES.ABORTED) {
        super(message);
        this.name = 'HttpAbortedError';
        this.suggestion = 'Verifica tu conexión a internet y vuelve a intentarlo';
    }
}
exports.HttpAbortedError = HttpAbortedError;
class HttpAuthError extends HttpError {
    constructor(message = HttpError.ERROR_MESSAGES.SESSION_EXPIRED) {
        super(message);
        this.name = 'HttpAuthError';
        this.suggestion = 'Verifica tu conexión a internet y vuelve a intentarlo';
    }
}
exports.HttpAuthError = HttpAuthError;
