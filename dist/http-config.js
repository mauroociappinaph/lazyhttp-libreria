"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.axiosInstance = exports.AUTH_ENDPOINTS = exports.AUTH_STORAGE = exports.DEFAULT_RETRIES = exports.DEFAULT_TIMEOUT = exports.API_URL = exports.debugConfig = exports.DebugLevel = void 0;
exports.createAxiosInstance = createAxiosInstance;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
var DebugLevel;
(function (DebugLevel) {
    DebugLevel[DebugLevel["NONE"] = 0] = "NONE";
    DebugLevel[DebugLevel["ERROR"] = 1] = "ERROR";
    DebugLevel[DebugLevel["WARNING"] = 2] = "WARNING";
    DebugLevel[DebugLevel["INFO"] = 3] = "INFO";
    DebugLevel[DebugLevel["DEBUG"] = 4] = "DEBUG";
})(DebugLevel || (exports.DebugLevel = DebugLevel = {}));
exports.debugConfig = {
    level: process.env.NODE_ENV === 'development' ? DebugLevel.INFO : DebugLevel.ERROR,
    logRequests: true,
    logResponses: true,
    prettyPrintJSON: process.env.NODE_ENV === 'development',
    colors: {
        error: '#FF6B6B',
        warning: '#FFD166',
        info: '#06D6A0',
        debug: '#118AB2',
        default: '#073B4C'
    }
};
exports.API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
exports.DEFAULT_TIMEOUT = 10000;
exports.DEFAULT_RETRIES = 0;
exports.AUTH_STORAGE = {
    TOKEN_KEY: 'token',
    REFRESH_TOKEN_KEY: 'refreshToken',
};
exports.AUTH_ENDPOINTS = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',
};
function createAxiosInstance() {
    return axios_1.default.create({
        baseURL: exports.API_URL,
        timeout: exports.DEFAULT_TIMEOUT,
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
exports.axiosInstance = createAxiosInstance();
