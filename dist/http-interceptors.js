"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authInterceptors = void 0;
exports.setupInterceptors = setupInterceptors;
exports.refreshToken = refreshToken;
exports.handleRefreshTokenFailure = handleRefreshTokenFailure;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const http_errors_1 = require("./http-errors");
const http_config_1 = require("./http-config");
let isRefreshing = false;
let failedRequests = [];
function setupInterceptors(instance = http_config_1.httpInstance) {
    instance.interceptors.request.use((config) => {
        var _a;
        if ((_a = config.url) === null || _a === void 0 ? void 0 : _a.includes(http_config_1.AUTH_ENDPOINTS.REFRESH_TOKEN)) {
            return config;
        }
        const token = localStorage.getItem(http_config_1.AUTH_STORAGE.TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }, (error) => Promise.reject(error));
    instance.interceptors.response.use((response) => response, async (error) => {
        var _a;
        const originalRequest = error.config;
        if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401 &&
            originalRequest &&
            originalRequest.url &&
            !originalRequest.url.includes(http_config_1.AUTH_ENDPOINTS.REFRESH_TOKEN)) {
            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    const newToken = await refreshToken();
                    if (newToken) {
                        localStorage.setItem(http_config_1.AUTH_STORAGE.TOKEN_KEY, newToken);
                        failedRequests.forEach((callback) => callback());
                        failedRequests = [];
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        }
                        return (0, axios_1.default)(originalRequest);
                    }
                }
                catch (_b) {
                    handleRefreshTokenFailure();
                }
                finally {
                    isRefreshing = false;
                }
            }
            return new Promise((resolve) => {
                failedRequests.push(() => {
                    if (originalRequest.headers) {
                        const token = localStorage.getItem(http_config_1.AUTH_STORAGE.TOKEN_KEY);
                        if (token) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                    }
                    resolve((0, axios_1.default)(originalRequest));
                });
            });
        }
        return Promise.reject(error);
    });
}
async function refreshToken() {
    var _a;
    const refreshToken = localStorage.getItem(http_config_1.AUTH_STORAGE.REFRESH_TOKEN_KEY);
    if (!refreshToken) {
        throw new http_errors_1.HttpAuthError('No refresh token available');
    }
    const response = await axios_1.default.post(`${http_config_1.AUTH_ENDPOINTS.REFRESH_TOKEN}`, { refreshToken }, { baseURL: http_config_1.httpInstance.defaults.baseURL });
    if (!((_a = response.data) === null || _a === void 0 ? void 0 : _a.token)) {
        throw new http_errors_1.HttpAuthError('Invalid token response');
    }
    return response.data.token;
}
function handleRefreshTokenFailure() {
    localStorage.removeItem(http_config_1.AUTH_STORAGE.TOKEN_KEY);
    localStorage.removeItem(http_config_1.AUTH_STORAGE.REFRESH_TOKEN_KEY);
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
}
exports.authInterceptors = {
    setupInterceptors,
    refreshToken,
    handleRefreshTokenFailure
};
