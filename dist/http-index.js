"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepFindLazy = exports.loadSoaModule = exports.loadProxyModule = exports.loadStreamingModule = exports.httpLogger = exports.getCurrentMetrics = exports.trackActivity = exports.configureMetrics = exports.invalidateCacheByTags = exports.invalidateCache = exports.configureCaching = exports.initialize = exports.getAccessToken = exports.getAuthenticatedUser = exports.isAuthenticated = exports.logout = exports.login = exports.configureAuth = exports.del = exports.patch = exports.put = exports.post = exports.getById = exports.getAll = exports.get = exports.request = exports.http = void 0;
const tslib_1 = require("tslib");
var http_exports_1 = require("./client/exports/http-exports");
Object.defineProperty(exports, "http", { enumerable: true, get: function () { return http_exports_1.http; } });
var http_methods_1 = require("./client/exports/http-methods");
Object.defineProperty(exports, "request", { enumerable: true, get: function () { return http_methods_1.request; } });
Object.defineProperty(exports, "get", { enumerable: true, get: function () { return http_methods_1.get; } });
Object.defineProperty(exports, "getAll", { enumerable: true, get: function () { return http_methods_1.getAll; } });
Object.defineProperty(exports, "getById", { enumerable: true, get: function () { return http_methods_1.getById; } });
Object.defineProperty(exports, "post", { enumerable: true, get: function () { return http_methods_1.post; } });
Object.defineProperty(exports, "put", { enumerable: true, get: function () { return http_methods_1.put; } });
Object.defineProperty(exports, "patch", { enumerable: true, get: function () { return http_methods_1.patch; } });
Object.defineProperty(exports, "del", { enumerable: true, get: function () { return http_methods_1.del; } });
var http_auth_exports_1 = require("./client/exports/http-auth-exports");
Object.defineProperty(exports, "configureAuth", { enumerable: true, get: function () { return http_auth_exports_1.configureAuth; } });
Object.defineProperty(exports, "login", { enumerable: true, get: function () { return http_auth_exports_1.login; } });
Object.defineProperty(exports, "logout", { enumerable: true, get: function () { return http_auth_exports_1.logout; } });
Object.defineProperty(exports, "isAuthenticated", { enumerable: true, get: function () { return http_auth_exports_1.isAuthenticated; } });
Object.defineProperty(exports, "getAuthenticatedUser", { enumerable: true, get: function () { return http_auth_exports_1.getAuthenticatedUser; } });
Object.defineProperty(exports, "getAccessToken", { enumerable: true, get: function () { return http_auth_exports_1.getAccessToken; } });
var http_config_exports_1 = require("./client/exports/http-config-exports");
Object.defineProperty(exports, "initialize", { enumerable: true, get: function () { return http_config_exports_1.initialize; } });
Object.defineProperty(exports, "configureCaching", { enumerable: true, get: function () { return http_config_exports_1.configureCaching; } });
Object.defineProperty(exports, "invalidateCache", { enumerable: true, get: function () { return http_config_exports_1.invalidateCache; } });
Object.defineProperty(exports, "invalidateCacheByTags", { enumerable: true, get: function () { return http_config_exports_1.invalidateCacheByTags; } });
Object.defineProperty(exports, "configureMetrics", { enumerable: true, get: function () { return http_config_exports_1.configureMetrics; } });
Object.defineProperty(exports, "trackActivity", { enumerable: true, get: function () { return http_config_exports_1.trackActivity; } });
Object.defineProperty(exports, "getCurrentMetrics", { enumerable: true, get: function () { return http_config_exports_1.getCurrentMetrics; } });
var http_logger_exports_1 = require("./client/exports/http-logger-exports");
Object.defineProperty(exports, "httpLogger", { enumerable: true, get: function () { return http_logger_exports_1.httpLogger; } });
tslib_1.__exportStar(require("./resources"), exports);
const loadStreamingModule = async () => {
    const { stream } = await Promise.resolve().then(() => tslib_1.__importStar(require('./client/exports/http-streaming-exports')));
    return { stream };
};
exports.loadStreamingModule = loadStreamingModule;
const loadProxyModule = async () => {
    const { configureProxy } = await Promise.resolve().then(() => tslib_1.__importStar(require('./client/exports/http-proxy-exports')));
    return { configureProxy };
};
exports.loadProxyModule = loadProxyModule;
const loadSoaModule = async () => {
    const { createSoaClient, createSoaServer } = await Promise.resolve().then(() => tslib_1.__importStar(require('./client/exports/http-soa-exports')));
    return {
        createSoaClient,
        createSoaServer
    };
};
exports.loadSoaModule = loadSoaModule;
var utils_1 = require("./utils");
Object.defineProperty(exports, "deepFindLazy", { enumerable: true, get: function () { return utils_1.deepFindLazy; } });
