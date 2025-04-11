"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentMetrics = exports.trackActivity = exports.configureMetrics = exports.initialize = exports.invalidateCacheByTags = exports.invalidateCache = exports.configureCaching = exports.getAccessToken = exports.getAuthenticatedUser = exports.isAuthenticated = exports.logout = exports.login = exports.configureAuth = exports.del = exports.patch = exports.put = exports.post = exports.getById = exports.getAll = exports.get = exports.request = exports.http = void 0;
const http_helpers_1 = require("./http-helpers");
const http_auth_1 = require("./http-auth");
const http_cache_1 = require("./http-cache");
const http_cache_strategies_1 = require("./http-cache-strategies");
const http_metrics_index_1 = require("./metrics/http-metrics-index");
const DEFAULT_TIMEOUT = 10000; // 10 segundos
const DEFAULT_RETRIES = 0;
exports.http = {
    _baseUrl: undefined,
    _frontendUrl: undefined,
    _defaultTimeout: DEFAULT_TIMEOUT,
    _defaultRetries: DEFAULT_RETRIES,
    _defaultHeaders: {},
    _requestInterceptors: [],
    _responseInterceptors: [],
    _setupInterceptors(interceptor, type) {
        // If no parameters were provided, initialize the arrays
        if (!interceptor && !type) {
            this._requestInterceptors = [];
            this._responseInterceptors = [];
            return;
        }
        // Add the interceptor to the appropriate array
        if (type === 'request') {
            this._requestInterceptors.push(interceptor);
        }
        else if (type === 'response') {
            this._responseInterceptors.push(interceptor);
        }
    },
    async request(endpoint, options = {}) {
        const { method = 'GET', headers = {}, body, withAuth = false, timeout = DEFAULT_TIMEOUT, retries = DEFAULT_RETRIES, cache: cacheOptions } = options;
        try {
            // Registrar la petición en métricas
            http_metrics_index_1.metricsManager.trackRequest(endpoint);
            // Comprobar si debemos usar la caché
            if (http_cache_1.cacheManager.shouldUseCache(method, options)) {
                const cacheKey = http_cache_1.cacheManager.generateCacheKey(endpoint, options);
                return await (0, http_cache_strategies_1.executeWithCacheStrategy)(cacheKey, async () => {
                    const requestHeaders = (0, http_helpers_1.prepareHeaders)(headers, withAuth);
                    const response = await http_helpers_1.retryHandler.executeWithRetry(this._baseUrl ? `${this._baseUrl}${endpoint}` : endpoint, method, requestHeaders, body, timeout || this._defaultTimeout || DEFAULT_TIMEOUT, retries !== undefined ? retries : this._defaultRetries !== undefined ? this._defaultRetries : DEFAULT_RETRIES);
                    // Invalidar caché automáticamente para métodos de escritura
                    if (method !== 'GET') {
                        http_cache_1.cacheManager.invalidateByMethod(method, endpoint);
                    }
                    return response;
                }, options);
            }
            // Petición sin caché
            const requestHeaders = (0, http_helpers_1.prepareHeaders)(headers, withAuth);
            const response = await http_helpers_1.retryHandler.executeWithRetry(this._baseUrl ? `${this._baseUrl}${endpoint}` : endpoint, method, requestHeaders, body, timeout || this._defaultTimeout || DEFAULT_TIMEOUT, retries !== undefined ? retries : this._defaultRetries !== undefined ? this._defaultRetries : DEFAULT_RETRIES);
            // Invalidar caché automáticamente para métodos de escritura
            if (method !== 'GET') {
                http_cache_1.cacheManager.invalidateByMethod(method, endpoint);
            }
            return response;
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
        const authInfo = await (0, http_auth_1.login)(credentials);
        // Iniciar seguimiento de métricas si la autenticación fue exitosa
        if (authInfo.isAuthenticated) {
            http_metrics_index_1.metricsManager.startTracking();
        }
        return authInfo;
    },
    async logout() {
        // Finalizar sesión de métricas y enviar datos
        const metrics = await http_metrics_index_1.metricsManager.stopTracking();
        // Si hay métricas y debug está activado, mostrar resumen
        if (metrics) {
            console.log(`[HTTP] Sesión finalizada - Tiempo activo: ${Math.round(metrics.activeTime / 1000)}s, Peticiones: ${metrics.requestCount}`);
        }
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
    async initialize(config) {
        // Set base URL if provided
        if (config === null || config === void 0 ? void 0 : config.baseUrl) {
            this._baseUrl = config.baseUrl;
        }
        // Store frontend URL if provided
        if (config === null || config === void 0 ? void 0 : config.frontendUrl) {
            this._frontendUrl = config.frontendUrl;
        }
        // Set global defaults if provided
        if ((config === null || config === void 0 ? void 0 : config.timeout) !== undefined) {
            this._defaultTimeout = config.timeout;
        }
        if ((config === null || config === void 0 ? void 0 : config.retries) !== undefined) {
            this._defaultRetries = config.retries;
        }
        if (config === null || config === void 0 ? void 0 : config.headers) {
            this._defaultHeaders = { ...this._defaultHeaders, ...config.headers };
        }
        // Inicializar caché si está configurado
        if (config === null || config === void 0 ? void 0 : config.cache) {
            this.configureCaching(config.cache);
        }
        // Inicializar métricas si está configurado
        if (config === null || config === void 0 ? void 0 : config.metrics) {
            this.configureMetrics(config.metrics);
        }
        return (0, http_helpers_1.initialize)();
    },
    // Métodos adicionales para caché
    configureCaching(config) {
        http_cache_1.cacheManager.configure(config);
    },
    invalidateCache(pattern) {
        http_cache_1.cacheManager.invalidate(pattern);
    },
    invalidateCacheByTags(tags) {
        http_cache_1.cacheManager.invalidateByTags(tags);
    },
    // Métodos para métricas
    configureMetrics(config) {
        http_metrics_index_1.metricsManager.configure(config);
    },
    trackActivity(type) {
        http_metrics_index_1.metricsManager.trackActivity(type);
    },
    getCurrentMetrics() {
        return http_metrics_index_1.metricsManager.getCurrentMetrics();
    }
};
// Exportar las funciones individuales para un uso más directo
exports.request = exports.http.request.bind(exports.http);
exports.get = exports.http.get.bind(exports.http);
exports.getAll = exports.http.getAll.bind(exports.http);
exports.getById = exports.http.getById.bind(exports.http);
exports.post = exports.http.post.bind(exports.http);
exports.put = exports.http.put.bind(exports.http);
exports.patch = exports.http.patch.bind(exports.http);
exports.del = exports.http.delete.bind(exports.http); // 'delete' es palabra reservada en JavaScript
// Exportar las funciones de autenticación
exports.configureAuth = exports.http.configureAuth.bind(exports.http);
exports.login = exports.http.login.bind(exports.http);
exports.logout = exports.http.logout.bind(exports.http);
exports.isAuthenticated = exports.http.isAuthenticated.bind(exports.http);
exports.getAuthenticatedUser = exports.http.getAuthenticatedUser.bind(exports.http);
exports.getAccessToken = exports.http.getAccessToken.bind(exports.http);
// Exportar caché
exports.configureCaching = exports.http.configureCaching.bind(exports.http);
exports.invalidateCache = exports.http.invalidateCache.bind(exports.http);
exports.invalidateCacheByTags = exports.http.invalidateCacheByTags.bind(exports.http);
// Exportar initialize
exports.initialize = exports.http.initialize.bind(exports.http);
// Exportar funciones de métricas
exports.configureMetrics = exports.http.configureMetrics.bind(exports.http);
exports.trackActivity = exports.http.trackActivity.bind(exports.http);
exports.getCurrentMetrics = exports.http.getCurrentMetrics.bind(exports.http);
