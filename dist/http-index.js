"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentMetrics = exports.trackActivity = exports.configureMetrics = exports.initialize = exports.invalidateCacheByTags = exports.invalidateCache = exports.configureCaching = exports.getAccessToken = exports.getAuthenticatedUser = exports.isAuthenticated = exports.logout = exports.login = exports.configureAuth = exports.del = exports.patch = exports.put = exports.post = exports.getById = exports.getAll = exports.get = exports.request = exports.http = void 0;
const barrels_1 = require("./barrels");
const https_proxy_agent_1 = require("https-proxy-agent");
const socks_proxy_agent_1 = require("socks-proxy-agent");
const DEFAULT_TIMEOUT = 10000;
const DEFAULT_RETRIES = 0;
class HttpClient {
    constructor() {
        this.core = new barrels_1.HttpCore();
    }
    get _baseUrl() {
        return barrels_1.httpConfiguration.baseUrl;
    }
    set _baseUrl(url) {
        barrels_1.httpConfiguration.baseUrl = url;
        this.core._baseUrl = url;
    }
    get _frontendUrl() {
        return barrels_1.httpConfiguration.frontendUrl;
    }
    set _frontendUrl(url) {
        barrels_1.httpConfiguration.frontendUrl = url;
    }
    get _defaultTimeout() {
        return barrels_1.httpConfiguration.defaultTimeout;
    }
    set _defaultTimeout(timeout) {
        barrels_1.httpConfiguration.defaultTimeout = timeout;
        this.core._defaultTimeout = timeout;
    }
    get _defaultRetries() {
        return barrels_1.httpConfiguration.defaultRetries;
    }
    set _defaultRetries(retries) {
        barrels_1.httpConfiguration.defaultRetries = retries;
        this.core._defaultRetries = retries;
    }
    get _defaultHeaders() {
        return barrels_1.httpConfiguration.defaultHeaders;
    }
    set _defaultHeaders(headers) {
        barrels_1.httpConfiguration.defaultHeaders = headers;
        this.core._defaultHeaders = headers;
    }
    get _requestInterceptors() {
        return barrels_1.interceptorsManager.getRequestInterceptors();
    }
    get _responseInterceptors() {
        return barrels_1.interceptorsManager.getResponseInterceptors();
    }
    get _proxyConfig() {
        return barrels_1.httpConfiguration.proxyConfig;
    }
    set _proxyConfig(config) {
        if (config) {
            barrels_1.httpConfiguration.configureProxy(config);
        }
    }
    get _defaultStreamConfig() {
        return barrels_1.httpConfiguration.streamConfig;
    }
    set _defaultStreamConfig(config) {
        if (config) {
            barrels_1.httpConfiguration.configureStream(config);
        }
    }
    async request(endpoint, options = {}) {
        return this.core.request(endpoint, options);
    }
    async get(endpoint, options) {
        return this.core.get(endpoint, options);
    }
    async getAll(endpoint, options) {
        return this.core.getAll(endpoint, options);
    }
    async getById(endpoint, id, options) {
        return this.core.getById(endpoint, id, options);
    }
    async post(endpoint, body, options) {
        return this.core.post(endpoint, body, options);
    }
    async put(endpoint, body, options) {
        return this.core.put(endpoint, body, options);
    }
    async patch(endpoint, body, options) {
        return this.core.patch(endpoint, body, options);
    }
    async delete(endpoint, options) {
        return this.core.delete(endpoint, options);
    }
    _setupInterceptors(interceptor, type) {
        barrels_1.interceptorsManager.setupInterceptors(interceptor, type);
    }
    configureAuth(config) {
        (0, barrels_1.configureAuthHelper)(config);
    }
    async login(credentials) {
        const response = await (0, barrels_1.loginHelper)(credentials);
        const authInfo = {
            accessToken: response.access_token,
            isAuthenticated: true,
            refreshToken: response.refresh_token
        };
        if (authInfo.isAuthenticated) {
            barrels_1.metricsManager.startTracking();
        }
        return authInfo;
    }
    async logout() {
        const metrics = await barrels_1.metricsManager.stopTracking();
        if (metrics) {
            console.log(`[HTTP] Sesión finalizada - Tiempo activo: ${Math.round(metrics.activeTime / 1000)}s, Peticiones: ${metrics.requestCount}`);
        }
        return (0, barrels_1.logoutHelper)();
    }
    isAuthenticated() {
        return (0, barrels_1.isAuthenticatedHelper)();
    }
    async getAuthenticatedUser() {
        return (0, barrels_1.getAuthenticatedUserHelper)();
    }
    getAccessToken() {
        return (0, barrels_1.getAccessTokenHelper)();
    }
    async _refreshToken() {
        return (0, barrels_1.refreshTokenAuthHelper)();
    }
    async _handleRefreshTokenFailure() {
        return (0, barrels_1.handleRefreshTokenFailureAuthHelper)();
    }
    _decodeToken(token) {
        return (0, barrels_1.decodeTokenHelper)(token);
    }
    _isTokenExpired(token) {
        return (0, barrels_1.isTokenExpiredHelper)(token);
    }
    _storeToken(key, value) {
        (0, barrels_1.storeTokenHelper)(key, value);
    }
    _getToken(key) {
        return (0, barrels_1.getTokenHelper)(key);
    }
    _removeToken(key) {
        (0, barrels_1.removeTokenHelper)(key);
    }
    async initialize(config) {
        await barrels_1.httpConfiguration.initialize(config);
        if (config === null || config === void 0 ? void 0 : config.baseUrl) {
            this.core._baseUrl = config.baseUrl;
        }
        if (config === null || config === void 0 ? void 0 : config.timeout) {
            this.core._defaultTimeout = config.timeout;
        }
        if ((config === null || config === void 0 ? void 0 : config.retries) !== undefined) {
            this.core._defaultRetries = config.retries;
        }
        if (config === null || config === void 0 ? void 0 : config.headers) {
            this.core._defaultHeaders = { ...this.core._defaultHeaders, ...config.headers };
        }
        return Promise.resolve();
    }
    configureCaching(config) {
        barrels_1.httpConfiguration.configureCaching(config);
    }
    invalidateCache(pattern) {
        barrels_1.httpConfiguration.invalidateCache(pattern);
    }
    invalidateCacheByTags(tags) {
        barrels_1.httpConfiguration.invalidateCacheByTags(tags);
    }
    configureMetrics(config) {
        barrels_1.httpConfiguration.configureMetrics(config);
    }
    trackActivity(type) {
        barrels_1.httpConfiguration.trackActivity(type);
    }
    getCurrentMetrics() {
        return barrels_1.httpConfiguration.getCurrentMetrics();
    }
    configureProxy(config) {
        barrels_1.httpConfiguration.configureProxy(config);
    }
    async stream(endpoint, options = {}) {
        return barrels_1.streamingManager.stream(endpoint, options);
    }
    _buildUrl(endpoint) {
        return this.core._baseUrl ? `${this.core._baseUrl}${endpoint}` : endpoint;
    }
    _prepareHeaders(options) {
        return (0, barrels_1.prepareHeaders)(options.headers || {}, options.withAuth || false);
    }
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
    }
}
exports.http = new HttpClient();
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
