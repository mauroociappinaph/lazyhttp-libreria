"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentMetrics = exports.trackActivity = exports.configureMetrics = exports.initialize = exports.invalidateCacheByTags = exports.invalidateCache = exports.configureCaching = exports.getAccessToken = exports.getAuthenticatedUser = exports.isAuthenticated = exports.logout = exports.login = exports.configureAuth = exports.del = exports.patch = exports.put = exports.post = exports.getById = exports.getAll = exports.get = exports.request = exports.http = void 0;
const tslib_1 = require("tslib");
const http_helpers_1 = require("./http-helpers");
const http_auth_1 = require("./http-auth");
const http_cache_1 = require("./http-cache");
const http_cache_strategies_1 = require("./http-cache-strategies");
const http_metrics_index_1 = require("./metrics/http-metrics-index");
const axios_1 = tslib_1.__importDefault(require("axios"));
const https_proxy_agent_1 = require("https-proxy-agent");
const socks_proxy_agent_1 = require("socks-proxy-agent");
const DEFAULT_TIMEOUT = 10000;
const DEFAULT_RETRIES = 0;
exports.http = {
    _baseUrl: undefined,
    _frontendUrl: undefined,
    _defaultTimeout: DEFAULT_TIMEOUT,
    _defaultRetries: DEFAULT_RETRIES,
    _defaultHeaders: {},
    _requestInterceptors: [],
    _responseInterceptors: [],
    _proxyConfig: undefined,
    _defaultStreamConfig: undefined,
    _setupInterceptors(interceptor, type) {
        if (!interceptor && !type) {
            this._requestInterceptors = [];
            this._responseInterceptors = [];
            return;
        }
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
            http_metrics_index_1.metricsManager.trackRequest(endpoint);
            if (http_cache_1.cacheManager.shouldUseCache(method, options)) {
                const cacheKey = http_cache_1.cacheManager.generateCacheKey(endpoint, options);
                return await (0, http_cache_strategies_1.executeWithCacheStrategy)(cacheKey, async () => {
                    const requestHeaders = (0, http_helpers_1.prepareHeaders)(headers, withAuth);
                    const response = await http_helpers_1.retryHandler.executeWithRetry(this._baseUrl ? `${this._baseUrl}${endpoint}` : endpoint, method, requestHeaders, body, timeout || this._defaultTimeout || DEFAULT_TIMEOUT, retries !== undefined ? retries : this._defaultRetries !== undefined ? this._defaultRetries : DEFAULT_RETRIES);
                    if (method !== 'GET') {
                        http_cache_1.cacheManager.invalidateByMethod(method, endpoint);
                    }
                    return response;
                }, options);
            }
            const requestHeaders = (0, http_helpers_1.prepareHeaders)(headers, withAuth);
            const response = await http_helpers_1.retryHandler.executeWithRetry(this._baseUrl ? `${this._baseUrl}${endpoint}` : endpoint, method, requestHeaders, body, timeout || this._defaultTimeout || DEFAULT_TIMEOUT, retries !== undefined ? retries : this._defaultRetries !== undefined ? this._defaultRetries : DEFAULT_RETRIES);
            if (method !== 'GET') {
                http_cache_1.cacheManager.invalidateByMethod(method, endpoint);
            }
            return response;
        }
        catch (error) {
            return http_helpers_1.errorHandler.handleError(error);
        }
    },
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
    configureAuth(config) {
        (0, http_auth_1.configureAuth)(config);
    },
    async login(credentials) {
        const response = await (0, http_auth_1.login)(credentials);
        const authInfo = {
            accessToken: response.access_token,
            isAuthenticated: true,
            refreshToken: response.refresh_token
        };
        if (authInfo.isAuthenticated) {
            http_metrics_index_1.metricsManager.startTracking();
        }
        return authInfo;
    },
    async logout() {
        const metrics = await http_metrics_index_1.metricsManager.stopTracking();
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
        if (config === null || config === void 0 ? void 0 : config.baseUrl) {
            this._baseUrl = config.baseUrl;
        }
        if (config === null || config === void 0 ? void 0 : config.frontendUrl) {
            this._frontendUrl = config.frontendUrl;
        }
        if ((config === null || config === void 0 ? void 0 : config.timeout) !== undefined) {
            this._defaultTimeout = config.timeout;
        }
        if ((config === null || config === void 0 ? void 0 : config.retries) !== undefined) {
            this._defaultRetries = config.retries;
        }
        if (config === null || config === void 0 ? void 0 : config.headers) {
            this._defaultHeaders = { ...this._defaultHeaders, ...config.headers };
        }
        if (config === null || config === void 0 ? void 0 : config.cache) {
            this.configureCaching(config.cache);
        }
        if (config === null || config === void 0 ? void 0 : config.metrics) {
            this.configureMetrics(config.metrics);
        }
        return (0, http_helpers_1.initialize)();
    },
    configureCaching(config) {
        http_cache_1.cacheManager.configure(config);
    },
    invalidateCache(pattern) {
        http_cache_1.cacheManager.invalidate(pattern);
    },
    invalidateCacheByTags(tags) {
        http_cache_1.cacheManager.invalidateByTags(tags);
    },
    configureMetrics(config) {
        http_metrics_index_1.metricsManager.configure(config);
    },
    trackActivity(type) {
        http_metrics_index_1.metricsManager.trackActivity(type);
    },
    getCurrentMetrics() {
        return http_metrics_index_1.metricsManager.getCurrentMetrics();
    },
    configureProxy(config) {
        this._proxyConfig = config;
    },
    async stream(endpoint, options = {}) {
        const streamConfig = {
            enabled: true,
            chunkSize: 8192,
            ...this._defaultStreamConfig,
            ...options.stream
        };
        if (!streamConfig.enabled) {
            throw new Error('Streaming no está habilitado para esta petición');
        }
        const proxyConfig = options.proxy || this._proxyConfig;
        const httpsAgent = this._createProxyAgent(proxyConfig);
        if ((proxyConfig === null || proxyConfig === void 0 ? void 0 : proxyConfig.rejectUnauthorized) === false) {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        }
        const axiosConfig = {
            method: 'GET',
            url: this._buildUrl(endpoint),
            responseType: 'stream',
            headers: this._prepareHeaders(options),
            timeout: options.timeout || this._defaultTimeout,
            proxy: false,
            httpsAgent
        };
        try {
            const response = await (0, axios_1.default)(axiosConfig);
            const stream = response.data;
            if (streamConfig.onChunk) {
                stream.on('data', (chunk) => {
                    streamConfig.onChunk(chunk);
                });
            }
            if (streamConfig.onEnd) {
                stream.on('end', () => {
                    streamConfig.onEnd();
                });
            }
            if (streamConfig.onError) {
                stream.on('error', (error) => {
                    streamConfig.onError(error);
                });
            }
            return stream;
        }
        catch (error) {
            if (streamConfig.onError) {
                streamConfig.onError(error);
            }
            throw error;
        }
        finally {
            if ((proxyConfig === null || proxyConfig === void 0 ? void 0 : proxyConfig.rejectUnauthorized) === false) {
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
            }
        }
    },
    _createProxyAgent(proxyConfig) {
        if (!proxyConfig)
            return undefined;
        const { url, protocol = 'http', auth, rejectUnauthorized = false } = proxyConfig;
        const proxyUrl = new URL(url);
        if (auth) {
            proxyUrl.username = auth.username;
            proxyUrl.password = auth.password;
        }
        const proxyString = proxyUrl.toString();
        if (protocol === 'socks') {
            return new socks_proxy_agent_1.SocksProxyAgent(proxyString);
        }
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = rejectUnauthorized ? '1' : '0';
        return new https_proxy_agent_1.HttpsProxyAgent(proxyString);
    },
    _buildUrl(endpoint) {
        return this._baseUrl ? `${this._baseUrl}${endpoint}` : endpoint;
    },
    _prepareHeaders(options) {
        return (0, http_helpers_1.prepareHeaders)(options.headers || {}, options.withAuth || false);
    }
};
exports.request = exports.http.request.bind(exports.http);
exports.get = exports.http.get.bind(exports.http);
exports.getAll = exports.http.getAll.bind(exports.http);
exports.getById = exports.http.getById.bind(exports.http);
exports.post = exports.http.post.bind(exports.http);
exports.put = exports.http.put.bind(exports.http);
exports.patch = exports.http.patch.bind(exports.http);
exports.del = exports.http.delete.bind(exports.http);
exports.configureAuth = exports.http.configureAuth.bind(exports.http);
exports.login = exports.http.login.bind(exports.http);
exports.logout = exports.http.logout.bind(exports.http);
exports.isAuthenticated = exports.http.isAuthenticated.bind(exports.http);
exports.getAuthenticatedUser = exports.http.getAuthenticatedUser.bind(exports.http);
exports.getAccessToken = exports.http.getAccessToken.bind(exports.http);
exports.configureCaching = exports.http.configureCaching.bind(exports.http);
exports.invalidateCache = exports.http.invalidateCache.bind(exports.http);
exports.invalidateCacheByTags = exports.http.invalidateCacheByTags.bind(exports.http);
exports.initialize = exports.http.initialize.bind(exports.http);
exports.configureMetrics = exports.http.configureMetrics.bind(exports.http);
exports.trackActivity = exports.http.trackActivity.bind(exports.http);
exports.getCurrentMetrics = exports.http.getCurrentMetrics.bind(exports.http);
