"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.http = void 0;
const http_helpers_1 = require("./http-helpers");
const http_auth_1 = require("./http-auth");
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
    async getAll(endpoint, options) {
        var _a, _b;
        const page = ((_a = options === null || options === void 0 ? void 0 : options.params) === null || _a === void 0 ? void 0 : _a.page) || 1;
        const limit = ((_b = options === null || options === void 0 ? void 0 : options.params) === null || _b === void 0 ? void 0 : _b.limit) || 100;
        const response = await this.request(endpoint, {
            ...options,
            method: 'GET',
            params: {
                ...options === null || options === void 0 ? void 0 : options.params,
                page,
                limit
            }
        });
        // Agregar metadatos de paginación a la respuesta
        if (response.data && Array.isArray(response.data)) {
            response.meta = {
                currentPage: page,
                totalItems: response.data.length
            };
        }
        return response;
    },
    async getById(endpoint, id, options) {
        return this.request(endpoint, { ...options, method: 'GET', params: { id } });
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
    // Métodos de autenticación avanzada
    configureAuth(config) {
        (0, http_auth_1.configureAuth)(config);
    },
    async login(credentials) {
        return (0, http_auth_1.login)(credentials);
    },
    async logout() {
        return (0, http_auth_1.logout)();
    },
    isAuthenticated() {
        return (0, http_auth_1.isAuthenticated)();
    },
    async getAuthenticatedUser() {
        return (0, http_auth_1.getAuthenticatedUser)();
    },
    getAccessToken() {
        return (0, http_auth_1.getAccessToken)();
    },
    // Métodos internos para la implementación
    _setupInterceptors: http_helpers_1.setupInterceptors,
    async _refreshToken() {
        return (0, http_auth_1.refreshToken)();
    },
    async _handleRefreshTokenFailure() {
        return (0, http_auth_1.handleRefreshTokenFailure)();
    },
    _decodeToken(token) {
        return (0, http_auth_1.decodeToken)(token);
    },
    _isTokenExpired(token) {
        return (0, http_auth_1.isTokenExpired)(token);
    },
    _storeToken(key, value) {
        (0, http_auth_1.storeToken)(key, value);
    },
    _getToken(key) {
        return (0, http_auth_1.getToken)(key);
    },
    _removeToken(key) {
        (0, http_auth_1.removeToken)(key);
    },
    initialize: http_helpers_1.initialize
};
