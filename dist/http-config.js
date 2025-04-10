"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.axiosInstance = exports.AUTH_ENDPOINTS = exports.AUTH_STORAGE = exports.DEFAULT_RETRIES = exports.DEFAULT_TIMEOUT = exports.API_URL = exports.debugConfig = exports.DebugLevel = void 0;
exports.createAxiosInstance = createAxiosInstance;
const axios_1 = __importDefault(require("axios"));
/**
 * Niveles de depuración para el cliente HTTP
 */
var DebugLevel;
(function (DebugLevel) {
    DebugLevel[DebugLevel["NONE"] = 0] = "NONE";
    DebugLevel[DebugLevel["ERROR"] = 1] = "ERROR";
    DebugLevel[DebugLevel["WARNING"] = 2] = "WARNING";
    DebugLevel[DebugLevel["INFO"] = 3] = "INFO";
    DebugLevel[DebugLevel["DEBUG"] = 4] = "DEBUG"; // Todo detallado
})(DebugLevel || (exports.DebugLevel = DebugLevel = {}));
/**
 * Configuración de depuración
 */
exports.debugConfig = {
    /**
     * Nivel de depuración actual
     * @default DebugLevel.ERROR
     */
    level: process.env.NODE_ENV === 'development' ? DebugLevel.INFO : DebugLevel.ERROR,
    /**
     * Registrar detalles de peticiones HTTP
     * @default true
     */
    logRequests: true,
    /**
     * Registrar detalles de respuestas HTTP
     * @default true
     */
    logResponses: true,
    /**
     * Mostrar JSON formateado en consola
     * @default true en desarrollo, false en producción
     */
    prettyPrintJSON: process.env.NODE_ENV === 'development',
    /**
     * Colores para los diferentes niveles de log
     */
    colors: {
        error: '#FF6B6B',
        warning: '#FFD166',
        info: '#06D6A0',
        debug: '#118AB2',
        default: '#073B4C'
    }
};
/**
 * Configuración base para todas las peticiones HTTP
 */
exports.API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
exports.DEFAULT_TIMEOUT = 10000; // 10 segundos
exports.DEFAULT_RETRIES = 0;
/**
 * Configuración para almacenamiento de tokens
 */
exports.AUTH_STORAGE = {
    TOKEN_KEY: 'token',
    REFRESH_TOKEN_KEY: 'refreshToken',
};
/**
 * Endpoints para autenticación
 */
exports.AUTH_ENDPOINTS = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',
};
/**
 * Crea una instancia configurada de Axios
 */
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
/**
 * Instancia global de Axios
 */
exports.axiosInstance = createAxiosInstance();
