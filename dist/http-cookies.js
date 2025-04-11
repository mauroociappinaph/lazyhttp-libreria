"use strict";
/**
 * Módulo para manejo de cookies en LazyHTTP
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CookieManager = void 0;
/**
 * Clase para manejar cookies en LazyHTTP
 */
class CookieManager {
    /**
     * Establece una cookie
     * @param name Nombre de la cookie
     * @param value Valor de la cookie
     * @param options Opciones de la cookie
     */
    static set(name, value, options = {}) {
        let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
        if (options.maxAge !== undefined) {
            cookie += `; Max-Age=${options.maxAge}`;
        }
        if (options.expires) {
            cookie += `; Expires=${options.expires.toUTCString()}`;
        }
        if (options.domain) {
            cookie += `; Domain=${options.domain}`;
        }
        if (options.path) {
            cookie += `; Path=${options.path}`;
        }
        if (options.secure) {
            cookie += '; Secure';
        }
        if (options.httpOnly) {
            cookie += '; HttpOnly';
        }
        if (options.sameSite) {
            cookie += `; SameSite=${options.sameSite}`;
        }
        document.cookie = cookie;
    }
    /**
     * Obtiene el valor de una cookie
     * @param name Nombre de la cookie
     * @returns Valor de la cookie o null si no existe
     */
    static get(name) {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [cookieName, cookieValue] = cookie.trim().split('=');
            if (decodeURIComponent(cookieName) === name) {
                return decodeURIComponent(cookieValue);
            }
        }
        return null;
    }
    /**
     * Elimina una cookie
     * @param name Nombre de la cookie
     * @param options Opciones adicionales para la eliminación
     */
    static remove(name, options = {}) {
        this.set(name, '', {
            ...options,
            maxAge: 0,
            expires: new Date(0)
        });
    }
    /**
     * Verifica si una cookie existe
     * @param name Nombre de la cookie
     * @returns true si la cookie existe, false en caso contrario
     */
    static exists(name) {
        return this.get(name) !== null;
    }
    /**
     * Obtiene todas las cookies como un objeto
     * @returns Objeto con todas las cookies
     */
    static getAll() {
        const cookies = {};
        if (document.cookie) {
            document.cookie.split(';').forEach(cookie => {
                const [name, value] = cookie.trim().split('=');
                cookies[decodeURIComponent(name)] = decodeURIComponent(value);
            });
        }
        return cookies;
    }
}
exports.CookieManager = CookieManager;
