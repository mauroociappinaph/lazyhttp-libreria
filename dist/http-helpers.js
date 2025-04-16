"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._handleRefreshTokenFailure = exports._refreshToken = exports._setupInterceptors = exports._logResponse = exports._logRequest = exports._prepareHeaders = exports._waitForRetry = exports._isRetryableError = exports._handleRetry = exports._executeWithRetry = exports._processResponse = exports._executeRequest = exports._handleError = exports.retryHandler = exports.responseProcessor = exports.requestExecutor = exports.errorHandler = exports.logger = void 0;
exports.logRequest = logRequest;
exports.logResponse = logResponse;
exports.prepareHeaders = prepareHeaders;
exports.setupInterceptors = setupInterceptors;
exports.refreshToken = refreshToken;
exports.handleRefreshTokenFailure = handleRefreshTokenFailure;
exports.initialize = initialize;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importStar(require("axios"));
const http_errors_1 = require("./http-errors");
const http_config_1 = require("./http-config");
const http_logger_1 = require("./http-logger");
exports.logger = {
    error(message, data) {
        if (http_config_1.debugConfig.level >= http_config_1.DebugLevel.ERROR) {
            this._log('error', message, data);
        }
    },
    warn(message, data) {
        if (http_config_1.debugConfig.level >= http_config_1.DebugLevel.WARNING) {
            this._log('warning', message, data);
        }
    },
    info(message, data) {
        if (http_config_1.debugConfig.level >= http_config_1.DebugLevel.INFO) {
            this._log('info', message, data);
        }
    },
    debug(message, data) {
        if (http_config_1.debugConfig.level >= http_config_1.DebugLevel.DEBUG) {
            this._log('debug', message, data);
        }
    },
    _log(level, message, data) {
        const colorStyle = `color: ${http_config_1.debugConfig.colors[level] || http_config_1.debugConfig.colors.default}; font-weight: bold;`;
        const timestamp = new Date().toISOString();
        const prefix = `[HTTP:${level.toUpperCase()}] [${timestamp}]`;
        console.group(`%c${prefix} ${message}`, colorStyle);
        if (data !== undefined) {
            if (http_config_1.debugConfig.prettyPrintJSON && typeof data === 'object') {
                console.log('%cDatos:', 'font-weight: bold');
                console.dir(data, { depth: null, colors: true });
            }
            else {
                console.log('%cDatos:', 'font-weight: bold', data);
            }
        }
        console.groupEnd();
    }
};
exports.errorHandler = {
    handleError(error) {
        var _a, _b, _c, _d, _e, _f;
        let response;
        if (error instanceof http_errors_1.HttpTimeoutError) {
            response = {
                data: null,
                error: ((_a = error.details) === null || _a === void 0 ? void 0 : _a.description) || http_errors_1.HttpTimeoutError.ERROR_MESSAGES.TIMEOUT,
                status: 408,
                details: error.details
            };
        }
        else if ((0, axios_1.isAxiosError)(error)) {
            const axiosError = new http_errors_1.HttpAxiosError();
            response = {
                data: null,
                error: ((_b = axiosError.details) === null || _b === void 0 ? void 0 : _b.description) || http_errors_1.HttpAxiosError.ERROR_MESSAGES.AXIOS_ERROR,
                status: ((_c = error.response) === null || _c === void 0 ? void 0 : _c.status) || 0,
                details: axiosError.details
            };
        }
        else if (error instanceof http_errors_1.HttpAbortedError) {
            response = {
                data: null,
                error: ((_d = error.details) === null || _d === void 0 ? void 0 : _d.description) || http_errors_1.HttpAbortedError.ERROR_MESSAGES.ABORTED,
                status: 0,
                details: error.details
            };
        }
        else if (error instanceof Error && error.message === 'TokenExpired') {
            const authError = new http_errors_1.HttpAuthError();
            response = {
                data: null,
                error: ((_e = authError.details) === null || _e === void 0 ? void 0 : _e.description) || http_errors_1.HttpAuthError.ERROR_MESSAGES.SESSION_EXPIRED,
                status: 401,
                details: authError.details
            };
        }
        else if (error instanceof Error) {
            response = {
                data: null,
                error: error.message || http_errors_1.HttpNetworkError.ERROR_MESSAGES.NETWORK,
                status: 0,
                details: error.details
            };
        }
        else {
            const unknownError = new http_errors_1.HttpUnknownError();
            response = {
                data: null,
                error: ((_f = unknownError.details) === null || _f === void 0 ? void 0 : _f.description) || http_errors_1.HttpUnknownError.ERROR_MESSAGES.UNKNOWN,
                status: 0,
                details: unknownError.details
            };
        }
        http_logger_1.httpLogger.logError(response);
        return response;
    }
};
function logRequest(method, url, headers, body) {
    if (!http_config_1.debugConfig.logRequests || http_config_1.debugConfig.level < http_config_1.DebugLevel.INFO)
        return;
    const safeHeaders = { ...headers };
    if (safeHeaders.Authorization) {
        safeHeaders.Authorization = safeHeaders.Authorization.replace(/Bearer .+/, 'Bearer [REDACTED]');
    }
    exports.logger.info(`${method} ${url}`, {
        headers: safeHeaders,
        body: body && http_config_1.debugConfig.prettyPrintJSON ? JSON.parse(JSON.stringify(body)) : body
    });
}
function logResponse(response) {
    if (!http_config_1.debugConfig.logResponses)
        return;
    const level = response.status >= 400 ? 'error' : 'info';
    const logFn = level === 'error' ? exports.logger.error.bind(exports.logger) : exports.logger.info.bind(exports.logger);
    logFn(`Respuesta ${response.status} ${response.config.url}`, {
        status: response.status,
        headers: response.headers,
        data: response.data
    });
}
function prepareHeaders(headers, withAuth) {
    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...headers,
    };
    if (withAuth) {
        try {
            const auth = require('./http-auth');
            const token = auth.getAccessToken();
            if (token) {
                defaultHeaders['Authorization'] = `Bearer ${token}`;
            }
        }
        catch (error) {
            const token = localStorage.getItem('token');
            if (token) {
                defaultHeaders['Authorization'] = `Bearer ${token}`;
            }
        }
    }
    return defaultHeaders;
}
exports.requestExecutor = {
    async executeRequest(endpoint, method, headers, body, signal) {
        const url = `${http_config_1.API_URL}${endpoint}`;
        logRequest(method, url, headers, body);
        return (0, axios_1.default)({
            url,
            method,
            headers,
            data: body,
            withCredentials: true,
            signal,
        });
    }
};
exports.responseProcessor = {
    processResponse(response) {
        logResponse(response);
        if (response.status >= 400) {
            const errorData = response.data;
            return {
                data: null,
                error: (errorData === null || errorData === void 0 ? void 0 : errorData.message) || response.statusText,
                status: response.status,
            };
        }
        return {
            data: response.data,
            error: null,
            status: response.status,
        };
    }
};
exports.retryHandler = {
    async executeWithRetry(endpoint, method, headers, body, timeout, retriesLeft) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await exports.requestExecutor.executeRequest(endpoint, method, headers, body, controller.signal);
            clearTimeout(timeoutId);
            return exports.responseProcessor.processResponse(response);
        }
        catch (error) {
            clearTimeout(timeoutId);
            return this.handleRetry(error, () => this.executeWithRetry(endpoint, method, headers, body, timeout, retriesLeft - 1), retriesLeft);
        }
    },
    async handleRetry(error, retryCallback, retriesLeft) {
        if (this.isRetryableError(error) && retriesLeft > 0) {
            await this.waitForRetry(retriesLeft);
            return retryCallback();
        }
        throw error;
    },
    isRetryableError(error) {
        if (axios_1.default.isAxiosError(error)) {
            return !error.response || error.response.status >= 500;
        }
        return false;
    },
    async waitForRetry(retriesLeft) {
        const delay = 1000 * Math.pow(2, 3 - retriesLeft);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
};
function setupInterceptors() {
    const axios = require('axios').default;
    axios.interceptors.request.use((config) => {
        return config;
    }, (error) => {
        return Promise.reject(error);
    });
    axios.interceptors.response.use((response) => {
        return response;
    }, async (error) => {
        if (error.response && error.response.status === 401) {
            try {
                const auth = require('./http-auth');
                if (auth.authState.refreshToken && auth.currentAuthConfig.endpoints.refresh) {
                    try {
                        const newToken = await auth.refreshToken();
                        if (newToken) {
                            const originalRequest = error.config;
                            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                            return axios(originalRequest);
                        }
                    }
                    catch (refreshError) {
                        await auth.handleRefreshTokenFailure();
                    }
                }
                else {
                    await auth.handleRefreshTokenFailure();
                }
            }
            catch (authError) {
                console.warn('Error al manejar token expirado', authError);
            }
        }
        return Promise.reject(error);
    });
}
async function refreshToken() {
    return Promise.resolve('');
}
async function handleRefreshTokenFailure() {
    return Promise.resolve();
}
async function initialize() {
    setupInterceptors();
    try {
        const savedConfig = localStorage.getItem('auth_config');
        if (savedConfig) {
            const auth = require('./http-auth');
            const parsedConfig = JSON.parse(savedConfig);
            auth.configureAuth(parsedConfig);
        }
    }
    catch (error) {
        console.warn('Error al cargar configuración de autenticación', error);
    }
    return Promise.resolve();
}
exports._handleError = exports.errorHandler.handleError;
exports._executeRequest = exports.requestExecutor.executeRequest;
exports._processResponse = exports.responseProcessor.processResponse;
exports._executeWithRetry = exports.retryHandler.executeWithRetry.bind(exports.retryHandler);
exports._handleRetry = exports.retryHandler.handleRetry.bind(exports.retryHandler);
exports._isRetryableError = exports.retryHandler.isRetryableError;
exports._waitForRetry = exports.retryHandler.waitForRetry;
exports._prepareHeaders = prepareHeaders;
exports._logRequest = logRequest;
exports._logResponse = logResponse;
exports._setupInterceptors = setupInterceptors;
exports._refreshToken = refreshToken;
exports._handleRefreshTokenFailure = handleRefreshTokenFailure;
