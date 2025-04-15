"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CookieManager = void 0;
class CookieManager {
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
    static remove(name, options = {}) {
        this.set(name, '', {
            ...options,
            maxAge: 0,
            expires: new Date(0)
        });
    }
    static exists(name) {
        return this.get(name) !== null;
    }
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
