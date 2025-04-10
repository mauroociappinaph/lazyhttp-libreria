"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.http = void 0;
const http_helpers_1 = require("./http-helpers");
const DEFAULT_TIMEOUT = 10000; // 10 segundos
const DEFAULT_RETRIES = 0;
exports.http = {
    async request(endpoint, options = {}) {
        const { method = 'GET', headers = {}, body, withAuth = false, timeout = DEFAULT_TIMEOUT, retries = DEFAULT_RETRIES, } = options;
        try {
            const requestHeaders = (0, http_helpers_1.prepareHeaders)(headers, withAuth);
            return await http_helpers_1.retryHandler.executeWithRetry(endpoint, method, requestHeaders, body, timeout, retries);
        }
        catch (error) {
            return http_helpers_1.errorHandler.handleError(error);
        }
    },
    // Métodos HTTP simplificados
    async get(endpoint, options) {
        return this.request(endpoint, { ...options, method: 'GET' });
    },
    async post(endpoint, body, options) {
        return this.request(endpoint, { ...options, method: 'POST', body });
    },
    async put(endpoint, body, options) {
        return this.request(endpoint, { ...options, method: 'PUT', body });
    },
    async patch(endpoint, body, options) {
        return this.request(endpoint, { ...options, method: 'PATCH', body });
    },
    async delete(endpoint, options) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    },
    // Métodos de autenticación
    _setupInterceptors: http_helpers_1.setupInterceptors,
    _refreshToken: http_helpers_1.refreshToken,
    _handleRefreshTokenFailure: http_helpers_1.handleRefreshTokenFailure,
    initialize: http_helpers_1.initialize
};
