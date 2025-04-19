"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadSoaModule = exports.loadProxyModule = exports.loadStreamingModule = exports.deepFindLazy = exports.httpLogger = exports.getCurrentMetrics = exports.trackActivity = exports.configureMetrics = exports.invalidateCacheByTags = exports.invalidateCache = exports.configureCaching = exports.initialize = exports.getAccessToken = exports.getAuthenticatedUser = exports.isAuthenticated = exports.logout = exports.login = exports.configureAuth = exports.del = exports.patch = exports.put = exports.post = exports.getById = exports.getAll = exports.get = exports.request = exports.http = void 0;
const tslib_1 = require("tslib");
const http_client_1 = require("./client/core/http-client");
exports.http = new http_client_1.HttpClient();
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
exports.initialize = exports.http.initialize.bind(exports.http);
exports.configureCaching = exports.http.configureCaching.bind(exports.http);
exports.invalidateCache = exports.http.invalidateCache.bind(exports.http);
exports.invalidateCacheByTags = exports.http.invalidateCacheByTags.bind(exports.http);
exports.configureMetrics = exports.http.configureMetrics.bind(exports.http);
exports.trackActivity = exports.http.trackActivity.bind(exports.http);
exports.getCurrentMetrics = exports.http.getCurrentMetrics.bind(exports.http);
const http_logger_1 = require("./http-logger");
Object.defineProperty(exports, "httpLogger", { enumerable: true, get: function () { return http_logger_1.httpLogger; } });
tslib_1.__exportStar(require("./resources"), exports);
var utils_1 = require("./utils");
Object.defineProperty(exports, "deepFindLazy", { enumerable: true, get: function () { return utils_1.deepFindLazy; } });
const loadStreamingModule = async () => {
    const { streamingManager } = await Promise.resolve().then(() => tslib_1.__importStar(require('./http-streaming')));
    return { stream: streamingManager.stream.bind(streamingManager) };
};
exports.loadStreamingModule = loadStreamingModule;
const loadProxyModule = async () => {
    return {
        configureProxy: (config) => {
            if (exports.http && typeof exports.http.configureProxy === 'function') {
                return exports.http.configureProxy(config);
            }
            throw new Error('Proxy configuration not available');
        }
    };
};
exports.loadProxyModule = loadProxyModule;
const loadSoaModule = async () => {
    try {
        return {
            createSoaClient: () => {
                console.warn('SOA module not properly loaded');
                return null;
            },
            createSoaServer: () => {
                console.warn('SOA module not properly loaded');
                return null;
            }
        };
    }
    catch (error) {
        console.error('Error loading SOA module:', error);
        return { createSoaClient: null, createSoaServer: null };
    }
};
exports.loadSoaModule = loadSoaModule;
