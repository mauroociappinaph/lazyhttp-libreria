"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentAuthConfig = exports.authState = exports.DEFAULT_AUTH_CONFIG = void 0;
exports.configureAuth = configureAuth;
exports.login = login;
exports.logout = logout;
exports.isAuthenticated = isAuthenticated;
exports.getAuthenticatedUser = getAuthenticatedUser;
exports.getAccessToken = getAccessToken;
exports.refreshToken = refreshToken;
exports.handleRefreshTokenFailure = handleRefreshTokenFailure;
exports.decodeToken = decodeToken;
exports.isTokenExpired = isTokenExpired;
exports.storeToken = storeToken;
exports.getToken = getToken;
exports.removeToken = removeToken;
const http_config_1 = require("./http-config");
const axios_1 = __importDefault(require("axios"));
const cookie_manager_1 = require("./cookie-manager");
/**
 * Configuración por defecto de autenticación
 */
exports.DEFAULT_AUTH_CONFIG = {
    baseURL: '',
    loginEndpoint: '/auth/login',
    logoutEndpoint: '/auth/logout',
    userInfoEndpoint: '/auth/me',
    refreshEndpoint: '/auth/refresh',
    tokenKey: 'token',
    refreshTokenKey: 'refreshToken',
    storage: 'localStorage'
};
/**
 * Estado actual de autenticación
 */
exports.authState = {
    accessToken: '',
    isAuthenticated: false
};
/**
 * Configuración actual de autenticación
 */
exports.currentAuthConfig = {
    baseURL: '',
    loginEndpoint: '/login',
    logoutEndpoint: '/logout',
    tokenKey: 'token',
    refreshTokenKey: 'refreshToken',
    storage: 'localStorage'
};
/**
 * Configura el sistema de autenticación
 * @param config Configuración personalizada
 */
function configureAuth(config) {
    exports.currentAuthConfig = {
        ...exports.currentAuthConfig,
        ...config
    };
    // Inicializar estado con tokens almacenados
    const accessToken = getToken(exports.currentAuthConfig.tokenKey);
    if (accessToken) {
        const tokenData = decodeToken(accessToken);
        const expiresAt = (tokenData === null || tokenData === void 0 ? void 0 : tokenData.exp) ? tokenData.exp * 1000 : undefined;
        // Solo consideramos válido si no está expirado
        if (!expiresAt || expiresAt > Date.now()) {
            const refreshTokenKey = exports.currentAuthConfig.refreshTokenKey || '';
            const refreshToken = getToken(refreshTokenKey);
            exports.authState = {
                accessToken,
                refreshToken: refreshToken || undefined,
                expiresAt,
                isAuthenticated: true
            };
        }
        else {
            // Limpiar tokens expirados
            removeToken(exports.currentAuthConfig.tokenKey);
            if (exports.currentAuthConfig.refreshTokenKey) {
                removeToken(exports.currentAuthConfig.refreshTokenKey);
            }
        }
    }
}
/**
 * Inicia sesión con las credenciales proporcionadas
 * @param credentials Credenciales del usuario
 * @returns Información de autenticación
 */
async function login(credentials) {
    try {
        const response = await fetch(`${exports.currentAuthConfig.baseURL}${exports.currentAuthConfig.loginEndpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });
        if (!response.ok) {
            throw new Error('Login failed');
        }
        const data = await response.json();
        storeToken(data.token, data.refreshToken);
        if (exports.currentAuthConfig.onLogin) {
            exports.currentAuthConfig.onLogin(data);
        }
        return data;
    }
    catch (error) {
        if (exports.currentAuthConfig.onError) {
            exports.currentAuthConfig.onError(error);
        }
        throw error;
    }
}
/**
 * Cierra la sesión actual
 */
async function logout() {
    try {
        const token = getToken(exports.currentAuthConfig.tokenKey);
        if (token) {
            await fetch(`${exports.currentAuthConfig.baseURL}${exports.currentAuthConfig.logoutEndpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        }
    }
    catch (error) {
        if (exports.currentAuthConfig.onError) {
            exports.currentAuthConfig.onError(error);
        }
    }
    finally {
        removeToken(exports.currentAuthConfig.tokenKey);
        if (exports.currentAuthConfig.onLogout) {
            exports.currentAuthConfig.onLogout();
        }
    }
}
/**
 * Verifica si el usuario está autenticado
 * @returns `true` si está autenticado, `false` en caso contrario
 */
function isAuthenticated() {
    return !!getToken(exports.currentAuthConfig.tokenKey);
}
/**
 * Obtiene la información del usuario autenticado
 * @returns Información del usuario o `null` si no está autenticado
 */
async function getAuthenticatedUser() {
    if (!isAuthenticated()) {
        return null;
    }
    // Si ya tenemos la información del usuario, devolverla
    if (exports.authState.user) {
        return exports.authState.user;
    }
    // Si no, intentar cargarla
    if (exports.currentAuthConfig.userInfoEndpoint) {
        try {
            const response = await axios_1.default.get(`${http_config_1.API_URL}${exports.currentAuthConfig.userInfoEndpoint}`, {
                headers: {
                    Authorization: `Bearer ${exports.authState.accessToken}`
                }
            });
            exports.authState.user = response.data;
            return exports.authState.user;
        }
        catch (error) {
            console.warn('No se pudo cargar la información del usuario');
            return null;
        }
    }
    return null;
}
/**
 * Obtiene el token de acceso actual
 * @returns Token de acceso o `null` si no está autenticado
 */
function getAccessToken() {
    if (!isAuthenticated()) {
        return null;
    }
    return exports.authState.accessToken;
}
/**
 * Refresca el token de autenticación
 * @returns El nuevo token de autenticación
 */
async function refreshToken() {
    if (!exports.currentAuthConfig.refreshEndpoint || !exports.authState.refreshToken) {
        throw new Error('No hay configuración para refrescar token');
    }
    try {
        const endpoint = `${http_config_1.API_URL}${exports.currentAuthConfig.refreshEndpoint}`;
        const response = await axios_1.default.post(endpoint, {
            refresh_token: exports.authState.refreshToken
        });
        if (!response.data.access_token) {
            throw new Error('No se recibió un token de acceso');
        }
        // Extraer datos de la respuesta
        const { access_token, refresh_token, expires_in } = response.data;
        // Calcular tiempo de expiración
        const expiresAt = expires_in
            ? Date.now() + (expires_in * 1000)
            : undefined;
        // Almacenar tokens
        storeToken(exports.currentAuthConfig.tokenKey, access_token);
        if (refresh_token && exports.currentAuthConfig.refreshTokenKey) {
            storeToken(exports.currentAuthConfig.refreshTokenKey, refresh_token);
        }
        // Actualizar estado
        exports.authState = {
            ...exports.authState,
            accessToken: access_token,
            refreshToken: refresh_token || exports.authState.refreshToken,
            expiresAt,
            isAuthenticated: true
        };
        return access_token;
    }
    catch (error) {
        // Manejar error de refresco
        if (exports.currentAuthConfig.onError) {
            exports.currentAuthConfig.onError(error);
        }
        throw error;
    }
}
/**
 * Maneja el fallo al refrescar el token
 */
async function handleRefreshTokenFailure() {
    // Limpiar tokens almacenados
    removeToken(exports.currentAuthConfig.tokenKey);
    if (exports.currentAuthConfig.refreshTokenKey) {
        removeToken(exports.currentAuthConfig.refreshTokenKey);
    }
    // Resetear estado
    exports.authState = {
        accessToken: '',
        isAuthenticated: false
    };
    // Notificar error de autenticación
    if (exports.currentAuthConfig.onError) {
        exports.currentAuthConfig.onError(new Error('Falló el refresco del token'));
    }
}
/**
 * Decodifica un token JWT
 * @param token Token JWT
 * @returns Payload del token decodificado
 */
function decodeToken(token) {
    try {
        // Dividir el token en sus partes
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }
        // Decodificar la parte del payload (segunda parte)
        const payload = parts[1];
        const decoded = JSON.parse(atob(payload));
        return decoded;
    }
    catch (error) {
        console.warn('Error al decodificar token', error);
        return null;
    }
}
/**
 * Verifica si un token está expirado
 * @param token Token a verificar o timestamp de expiración
 * @returns `true` si está expirado, `false` en caso contrario
 */
function isTokenExpired(token) {
    if (typeof token === 'number') {
        return token < Date.now();
    }
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
        return false;
    }
    const expiresAt = decoded.exp * 1000; // Convertir a milisegundos
    return expiresAt < Date.now();
}
/**
 * Almacena un token en el almacenamiento configurado
 * @param key Clave del token
 * @param value Valor del token
 */
function storeToken(key, value) {
    const cookieOptions = {
        ...exports.currentAuthConfig.cookieOptions,
        path: '/'
    };
    switch (exports.currentAuthConfig.storage) {
        case 'cookie':
            cookie_manager_1.CookieManager.set(key, value, cookieOptions);
            break;
        case 'localStorage':
            localStorage.setItem(key, value);
            break;
        case 'sessionStorage':
            sessionStorage.setItem(key, value);
            break;
    }
}
/**
 * Obtiene un token del almacenamiento configurado
 * @param key Clave del token
 * @returns Valor del token o null si no existe
 */
function getToken(key) {
    switch (exports.currentAuthConfig.storage) {
        case 'cookie':
            return cookie_manager_1.CookieManager.get(key);
        case 'localStorage':
            return localStorage.getItem(key);
        case 'sessionStorage':
            return sessionStorage.getItem(key);
        default:
            return null;
    }
}
/**
 * Elimina un token del almacenamiento configurado
 * @param key Clave del token
 */
function removeToken(key) {
    switch (exports.currentAuthConfig.storage) {
        case 'cookie':
            cookie_manager_1.CookieManager.remove(key, exports.currentAuthConfig.cookieOptions);
            break;
        case 'localStorage':
            localStorage.removeItem(key);
            break;
        case 'sessionStorage':
            sessionStorage.removeItem(key);
            break;
    }
}
