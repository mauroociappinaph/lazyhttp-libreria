"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authInterceptors = void 0;
exports.setupInterceptors = setupInterceptors;
exports.refreshToken = refreshToken;
exports.handleRefreshTokenFailure = handleRefreshTokenFailure;
const axios_1 = __importDefault(require("axios"));
const http_errors_1 = require("./http-errors");
const http_config_1 = require("./http-config");
// Estado para manejar el refresh token
let isRefreshing = false;
let failedRequests = [];
/**
 * Configura los interceptores para la instancia de Axios
 * @param instance Instancia de Axios a configurar
 */
function setupInterceptors(instance = http_config_1.axiosInstance) {
    // Interceptor de solicitud
    instance.interceptors.request.use((config) => {
        var _a;
        // No añadir token a peticiones de refresh
        if ((_a = config.url) === null || _a === void 0 ? void 0 : _a.includes(http_config_1.AUTH_ENDPOINTS.REFRESH_TOKEN)) {
            return config;
        }
        const token = localStorage.getItem(http_config_1.AUTH_STORAGE.TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }, (error) => Promise.reject(error));
    // Interceptor de respuesta
    instance.interceptors.response.use((response) => response, async (error) => {
        var _a;
        const originalRequest = error.config;
        // Solo intentar refresh si:
        // 1. Es un error 401 (Unauthorized)
        // 2. Hay un request original
        // 3. No es una petición de refresh token (evitar bucles)
        if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401 &&
            originalRequest &&
            originalRequest.url &&
            !originalRequest.url.includes(http_config_1.AUTH_ENDPOINTS.REFRESH_TOKEN)) {
            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    // Intentar obtener un nuevo token
                    const newToken = await refreshToken();
                    // Si se obtuvo un nuevo token, actualizar token y reintentar peticiones
                    if (newToken) {
                        // Almacenar nuevo token
                        localStorage.setItem(http_config_1.AUTH_STORAGE.TOKEN_KEY, newToken);
                        // Ejecutar todas las peticiones fallidas en cola
                        failedRequests.forEach((callback) => callback());
                        failedRequests = [];
                        // Reintentar la petición original con el nuevo token
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        }
                        return (0, axios_1.default)(originalRequest);
                    }
                }
                catch (_b) {
                    // Si falla el refresh, limpiar autenticación
                    handleRefreshTokenFailure();
                }
                finally {
                    isRefreshing = false;
                }
            }
            // Si ya está refrescando, añadir a la cola de peticiones pendientes
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
        // Si no es un error 401 o no se pudo manejar, rechazar normalmente
        return Promise.reject(error);
    });
}
/**
 * Obtiene un nuevo token usando el refresh token
 * @returns Nuevo token de acceso
 */
async function refreshToken() {
    var _a;
    const refreshToken = localStorage.getItem(http_config_1.AUTH_STORAGE.REFRESH_TOKEN_KEY);
    if (!refreshToken) {
        throw new http_errors_1.HttpAuthError('No refresh token available');
    }
    const response = await axios_1.default.post(`${http_config_1.AUTH_ENDPOINTS.REFRESH_TOKEN}`, { refreshToken }, { baseURL: http_config_1.axiosInstance.defaults.baseURL });
    if (!((_a = response.data) === null || _a === void 0 ? void 0 : _a.token)) {
        throw new http_errors_1.HttpAuthError('Invalid token response');
    }
    return response.data.token;
}
/**
 * Maneja el fallo al refrescar el token
 */
function handleRefreshTokenFailure() {
    // Limpiar tokens
    localStorage.removeItem(http_config_1.AUTH_STORAGE.TOKEN_KEY);
    localStorage.removeItem(http_config_1.AUTH_STORAGE.REFRESH_TOKEN_KEY);
    // Redirigir a login
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
}
// Exportar todo junto
exports.authInterceptors = {
    setupInterceptors,
    refreshToken,
    handleRefreshTokenFailure
};
