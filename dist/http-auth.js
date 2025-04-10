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
/**
 * Configuración por defecto de autenticación
 */
exports.DEFAULT_AUTH_CONFIG = {
    type: 'jwt',
    endpoints: {
        token: '/auth/login',
        refresh: '/auth/refresh',
        logout: '/auth/logout',
        userInfo: '/auth/me'
    },
    storage: 'localStorage',
    tokenKeys: {
        accessToken: 'token',
        refreshToken: 'refreshToken'
    },
    autoRefresh: true,
    refreshMargin: 60
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
exports.currentAuthConfig = { ...exports.DEFAULT_AUTH_CONFIG };
/**
 * Configura el sistema de autenticación
 * @param config Configuración personalizada
 */
function configureAuth(config) {
    exports.currentAuthConfig = {
        ...exports.DEFAULT_AUTH_CONFIG,
        ...config,
        endpoints: {
            ...exports.DEFAULT_AUTH_CONFIG.endpoints,
            ...config.endpoints
        },
        tokenKeys: {
            ...exports.DEFAULT_AUTH_CONFIG.tokenKeys,
            ...config.tokenKeys
        }
    };
    // Inicializar estado con tokens almacenados
    const accessToken = getToken(exports.currentAuthConfig.tokenKeys.accessToken);
    if (accessToken) {
        const tokenData = decodeToken(accessToken);
        const expiresAt = (tokenData === null || tokenData === void 0 ? void 0 : tokenData.exp) ? tokenData.exp * 1000 : undefined;
        // Solo consideramos válido si no está expirado
        if (!expiresAt || expiresAt > Date.now()) {
            const refreshTokenKey = exports.currentAuthConfig.tokenKeys.refreshToken || '';
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
            removeToken(exports.currentAuthConfig.tokenKeys.accessToken);
            if (exports.currentAuthConfig.tokenKeys.refreshToken) {
                removeToken(exports.currentAuthConfig.tokenKeys.refreshToken);
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
        const endpoint = `${http_config_1.API_URL}${exports.currentAuthConfig.endpoints.token}`;
        const response = await axios_1.default.post(endpoint, credentials);
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
        storeToken(exports.currentAuthConfig.tokenKeys.accessToken, access_token);
        if (refresh_token && exports.currentAuthConfig.tokenKeys.refreshToken) {
            storeToken(exports.currentAuthConfig.tokenKeys.refreshToken, refresh_token);
        }
        // Actualizar estado
        exports.authState = {
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresAt,
            isAuthenticated: true
        };
        // Cargar información del usuario si está configurado
        if (exports.currentAuthConfig.endpoints.userInfo) {
            try {
                const userResponse = await axios_1.default.get(`${http_config_1.API_URL}${exports.currentAuthConfig.endpoints.userInfo}`, {
                    headers: {
                        Authorization: `Bearer ${access_token}`
                    }
                });
                exports.authState.user = userResponse.data;
            }
            catch (error) {
                console.warn('No se pudo cargar la información del usuario');
            }
        }
        return exports.authState;
    }
    catch (error) {
        // Manejar error de autenticación
        if (exports.currentAuthConfig.onAuthError) {
            exports.currentAuthConfig.onAuthError(error);
        }
        throw error;
    }
}
/**
 * Cierra la sesión actual
 */
async function logout() {
    // Llamar al endpoint de logout si está configurado
    if (exports.currentAuthConfig.endpoints.logout && exports.authState.accessToken) {
        try {
            await axios_1.default.post(`${http_config_1.API_URL}${exports.currentAuthConfig.endpoints.logout}`, null, {
                headers: {
                    Authorization: `Bearer ${exports.authState.accessToken}`
                }
            });
        }
        catch (error) {
            console.warn('Error al cerrar sesión en el servidor', error);
        }
    }
    // Limpiar tokens almacenados
    removeToken(exports.currentAuthConfig.tokenKeys.accessToken);
    if (exports.currentAuthConfig.tokenKeys.refreshToken) {
        removeToken(exports.currentAuthConfig.tokenKeys.refreshToken);
    }
    // Resetear estado
    exports.authState = {
        accessToken: '',
        isAuthenticated: false
    };
}
/**
 * Verifica si el usuario está autenticado
 * @returns `true` si está autenticado, `false` en caso contrario
 */
function isAuthenticated() {
    // Verificar si está autenticado y el token no ha expirado
    if (!exports.authState.isAuthenticated || !exports.authState.accessToken) {
        return false;
    }
    // Si hay expiración definida, verificar
    if (exports.authState.expiresAt) {
        return exports.authState.expiresAt > Date.now();
    }
    return true;
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
    if (exports.currentAuthConfig.endpoints.userInfo) {
        try {
            const response = await axios_1.default.get(`${http_config_1.API_URL}${exports.currentAuthConfig.endpoints.userInfo}`, {
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
    if (!exports.currentAuthConfig.endpoints.refresh || !exports.authState.refreshToken) {
        throw new Error('No hay configuración para refrescar token');
    }
    try {
        const endpoint = `${http_config_1.API_URL}${exports.currentAuthConfig.endpoints.refresh}`;
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
        storeToken(exports.currentAuthConfig.tokenKeys.accessToken, access_token);
        if (refresh_token && exports.currentAuthConfig.tokenKeys.refreshToken) {
            storeToken(exports.currentAuthConfig.tokenKeys.refreshToken, refresh_token);
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
        if (exports.currentAuthConfig.onAuthError) {
            exports.currentAuthConfig.onAuthError(error);
        }
        throw error;
    }
}
/**
 * Maneja el fallo al refrescar el token
 */
async function handleRefreshTokenFailure() {
    // Limpiar tokens almacenados
    removeToken(exports.currentAuthConfig.tokenKeys.accessToken);
    if (exports.currentAuthConfig.tokenKeys.refreshToken) {
        removeToken(exports.currentAuthConfig.tokenKeys.refreshToken);
    }
    // Resetear estado
    exports.authState = {
        accessToken: '',
        isAuthenticated: false
    };
    // Notificar error de autenticación
    if (exports.currentAuthConfig.onAuthError) {
        exports.currentAuthConfig.onAuthError(new Error('Falló el refresco del token'));
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
    switch (exports.currentAuthConfig.storage) {
        case 'localStorage':
            localStorage.setItem(key, value);
            break;
        case 'sessionStorage':
            sessionStorage.setItem(key, value);
            break;
        case 'secureStorage':
            // Implementación para almacenamiento seguro
            // En un entorno real, se integraría con alguna biblioteca
            // de almacenamiento seguro o encriptación
            localStorage.setItem(`secure_${key}`, value);
            break;
        case 'memory':
            // No hacer nada, ya se guarda en authState
            break;
    }
}
/**
 * Obtiene un token del almacenamiento configurado
 * @param key Clave del token
 * @returns Token almacenado o `null` si no existe
 */
function getToken(key) {
    switch (exports.currentAuthConfig.storage) {
        case 'localStorage':
            return localStorage.getItem(key);
        case 'sessionStorage':
            return sessionStorage.getItem(key);
        case 'secureStorage':
            return localStorage.getItem(`secure_${key}`);
        case 'memory':
            // Para memory, depende del tipo de token
            if (key === exports.currentAuthConfig.tokenKeys.accessToken) {
                return exports.authState.accessToken;
            }
            else if (key === exports.currentAuthConfig.tokenKeys.refreshToken) {
                return exports.authState.refreshToken || null;
            }
            return null;
    }
    return null;
}
/**
 * Elimina un token del almacenamiento configurado
 * @param key Clave del token
 */
function removeToken(key) {
    switch (exports.currentAuthConfig.storage) {
        case 'localStorage':
            localStorage.removeItem(key);
            break;
        case 'sessionStorage':
            sessionStorage.removeItem(key);
            break;
        case 'secureStorage':
            localStorage.removeItem(`secure_${key}`);
            break;
        case 'memory':
            // No hacer nada, se limpiará en el estado
            break;
    }
}
