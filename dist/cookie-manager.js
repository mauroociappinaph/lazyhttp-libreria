"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CookieManager = void 0;
class CookieManager {
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
    static remove(name, options = {}) {
        const deleteOptions = {
            ...options,
            maxAge: 0,
            expires: new Date(0)
        };
        this.set(name, '', deleteOptions);
    }
    static exists(name) {
        return this.get(name) !== null;
    }
}
exports.CookieManager = CookieManager;
