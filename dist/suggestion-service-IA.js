"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestionService = exports.SuggestionService = void 0;
class SuggestionService {
    constructor(serviceUrl) {
        this.serviceUrl = 'http://localhost:8000';
        this.enabled = false;
        if (serviceUrl) {
            this.serviceUrl = serviceUrl;
        }
    }
    async enable() {
        try {
            const response = await fetch(`${this.serviceUrl}/suggest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error_type: 'HttpUnknownError',
                    status_code: 0
                })
            });
            if (response.ok) {
                this.enabled = true;
                return true;
            }
            return false;
        }
        catch (e) {
            console.warn('Suggestion service not available');
            return false;
        }
    }
    async getSuggestion(error, request) {
        if (!this.enabled) {
            return error.suggestion || "Verifica tu conexión a internet";
        }
        try {
            const errorInfo = {
                error_type: error.name || 'HttpUnknownError',
                status_code: error.status || 0,
                message: error.message,
                method: request === null || request === void 0 ? void 0 : request.method,
                url_pattern: request === null || request === void 0 ? void 0 : request.url
            };
            const response = await fetch(`${this.serviceUrl}/suggest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(errorInfo)
            });
            if (response.ok) {
                const data = await response.json();
                return data.suggestion;
            }
        }
        catch (e) {
            // Silenciar errores
        }
        return error.suggestion || "Verifica tu conexión a internet";
    }
    async provideFeedback(error, request, suggestion, wasHelpful) {
        if (!this.enabled)
            return;
        try {
            const feedbackData = {
                error_type: error.name || 'HttpUnknownError',
                status_code: error.status || 0,
                url_pattern: request === null || request === void 0 ? void 0 : request.url,
                method: request === null || request === void 0 ? void 0 : request.method,
                message: error.message,
                suggestion,
                was_helpful: wasHelpful
            };
            await fetch(`${this.serviceUrl}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedbackData)
            });
        }
        catch (e) {
            // Silenciar errores
        }
    }
}
exports.SuggestionService = SuggestionService;
// Instancia global
exports.suggestionService = new SuggestionService();
