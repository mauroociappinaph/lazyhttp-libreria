"use strict";
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
const tslib_1 = require("tslib");
const http_config_1 = require("./http-config");
const axios_1 = tslib_1.__importDefault(require("axios"));
const cookie_manager_1 = require("./cookie-manager");
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
exports.authState = {
    accessToken: '',
    isAuthenticated: false
};
exports.currentAuthConfig = {
    baseURL: '',
    loginEndpoint: '/login',
    logoutEndpoint: '/logout',
    tokenKey: 'token',
    refreshTokenKey: 'refreshToken',
    storage: 'localStorage'
};
function configureAuth(config) {
    exports.currentAuthConfig = {
        ...exports.currentAuthConfig,
        ...config
    };
    const accessToken = getToken(exports.currentAuthConfig.tokenKey);
    if (accessToken) {
        const tokenData = decodeToken(accessToken);
        const expiresAt = (tokenData === null || tokenData === void 0 ? void 0 : tokenData.exp) ? tokenData.exp * 1000 : undefined;
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
            removeToken(exports.currentAuthConfig.tokenKey);
            if (exports.currentAuthConfig.refreshTokenKey) {
                removeToken(exports.currentAuthConfig.refreshTokenKey);
            }
        }
    }
}
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
function isAuthenticated() {
    return !!getToken(exports.currentAuthConfig.tokenKey);
}
async function getAuthenticatedUser() {
    if (!isAuthenticated()) {
        return null;
    }
    if (exports.authState.user) {
        return exports.authState.user;
    }
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
function getAccessToken() {
    if (!isAuthenticated()) {
        return null;
    }
    return exports.authState.accessToken;
}
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
        const { access_token, refresh_token, expires_in } = response.data;
        const expiresAt = expires_in
            ? Date.now() + (expires_in * 1000)
            : undefined;
        storeToken(exports.currentAuthConfig.tokenKey, access_token);
        if (refresh_token && exports.currentAuthConfig.refreshTokenKey) {
            storeToken(exports.currentAuthConfig.refreshTokenKey, refresh_token);
        }
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
        if (exports.currentAuthConfig.onError) {
            exports.currentAuthConfig.onError(error);
        }
        throw error;
    }
}
async function handleRefreshTokenFailure() {
    removeToken(exports.currentAuthConfig.tokenKey);
    if (exports.currentAuthConfig.refreshTokenKey) {
        removeToken(exports.currentAuthConfig.refreshTokenKey);
    }
    exports.authState = {
        accessToken: '',
        isAuthenticated: false
    };
    if (exports.currentAuthConfig.onError) {
        exports.currentAuthConfig.onError(new Error('Falló el refresco del token'));
    }
}
function decodeToken(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }
        const payload = parts[1];
        const decoded = JSON.parse(atob(payload));
        return decoded;
    }
    catch (error) {
        console.warn('Error al decodificar token', error);
        return null;
    }
}
function isTokenExpired(token) {
    if (typeof token === 'number') {
        return token < Date.now();
    }
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
        return false;
    }
    const expiresAt = decoded.exp * 1000;
    return expiresAt < Date.now();
}
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
