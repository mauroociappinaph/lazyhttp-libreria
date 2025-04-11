"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CookieManager = void 0;
/**
 * Clase para manejar cookies de forma segura
 */
class CookieManager {
    /**
     * Establece una cookie con las opciones especificadas
     * @param name Nombre de la cookie
     * @param value Valor de la cookie
     * @param options Opciones de la cookie
     */
    static set(name, value, options = {}) {
        let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
        if (options.maxAge) {
            cookie += `; max-age=${options.maxAge}`;
        }
        if (options.expires) {
            cookie += `; expires=${options.expires.toUTCString()}`;
        }
        if (options.domain) {
            cookie += `; domain=${options.domain}`;
        }
        if (options.path) {
            cookie += `; path=${options.path}`;
        }
        if (options.secure) {
            cookie += '; secure';
        }
        if (options.httpOnly) {
            cookie += '; httpOnly';
        }
        if (options.sameSite) {
            cookie += `; samesite=${options.sameSite}`;
        }
        document.cookie = cookie;
    }
    /**
     * Obtiene el valor de una cookie por su nombre
     * @param name Nombre de la cookie
     * @returns Valor de la cookie o null si no existe
     */
    static get(name) {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [cookieName, cookieValue] = cookie.split('=').map(c => c.trim());
            if (cookieName === name) {
                return decodeURIComponent(cookieValue);
            }
        }
        return null;
    }
    /**
     * Elimina una cookie por su nombre
     * @param name Nombre de la cookie
     * @param options Opciones de la cookie (necesarias para eliminar correctamente)
     */
    static remove(name, options = {}) {
        const deleteOptions = {
            ...options,
            maxAge: 0,
            expires: new Date(0)
        };
        this.set(name, '', deleteOptions);
    }
    /**
     * Verifica si una cookie existe
     * @param name Nombre de la cookie
     * @returns true si la cookie existe, false en caso contrario
     */
    static exists(name) {
        return this.get(name) !== null;
    }
}
exports.CookieManager = CookieManager;
