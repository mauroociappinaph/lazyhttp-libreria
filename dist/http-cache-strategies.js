"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheFirst = cacheFirst;
exports.networkFirst = networkFirst;
exports.staleWhileRevalidate = staleWhileRevalidate;
exports.networkOnly = networkOnly;
exports.cacheOnly = cacheOnly;
exports.executeWithCacheStrategy = executeWithCacheStrategy;
const tslib_1 = require("tslib");
const cache = tslib_1.__importStar(require("./http-cache"));
async function cacheFirst(cacheKey, networkFetcher, options) {
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
        return cachedResponse;
    }
    try {
        const response = await networkFetcher();
        if (!response.error) {
            cache.set(cacheKey, response, options);
        }
        return response;
    }
    catch (error) {
        return {
            data: null,
            error: `Error obteniendo datos: ${error instanceof Error ? error.message : String(error)}`,
            status: 0
        };
    }
}
async function networkFirst(cacheKey, networkFetcher, options) {
    try {
        const response = await networkFetcher();
        if (!response.error) {
            cache.set(cacheKey, response, options);
        }
        return response;
    }
    catch (error) {
        const cachedResponse = cache.get(cacheKey);
        if (cachedResponse) {
            return {
                ...cachedResponse,
                meta: {
                    ...(cachedResponse.meta || {}),
                    fromCache: true,
                    networkError: String(error)
                }
            };
        }
        return {
            data: null,
            error: `Error obteniendo datos: ${error instanceof Error ? error.message : String(error)}`,
            status: 0
        };
    }
}
async function staleWhileRevalidate(cacheKey, networkFetcher, options) {
    const cachedResponse = cache.get(cacheKey);
    const updateCache = async () => {
        try {
            const freshResponse = await networkFetcher();
            if (!freshResponse.error) {
                cache.set(cacheKey, freshResponse, options);
            }
        }
        catch (error) {
            console.warn(`Error actualizando caché: ${error}`);
        }
    };
    if (cachedResponse) {
        updateCache();
        return {
            ...cachedResponse,
            meta: {
                ...(cachedResponse.meta || {}),
                fromCache: true,
                refreshing: true
            }
        };
    }
    try {
        const response = await networkFetcher();
        if (!response.error) {
            cache.set(cacheKey, response, options);
        }
        return response;
    }
    catch (error) {
        return {
            data: null,
            error: `Error obteniendo datos: ${error instanceof Error ? error.message : String(error)}`,
            status: 0
        };
    }
}
async function networkOnly(cacheKey, networkFetcher, options) {
    try {
        const response = await networkFetcher();
        if (!response.error && (options === null || options === void 0 ? void 0 : options.enabled) !== false) {
            cache.set(cacheKey, response, options);
        }
        return response;
    }
    catch (error) {
        return {
            data: null,
            error: `Error obteniendo datos: ${error instanceof Error ? error.message : String(error)}`,
            status: 0
        };
    }
}
async function cacheOnly(cacheKey) {
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
        return cachedResponse;
    }
    return {
        data: null,
        error: 'No hay datos en caché',
        status: 404
    };
}
async function executeWithCacheStrategy(cacheKey, networkFetcher, options) {
    const strategy = cache.getStrategy(options);
    switch (strategy) {
        case 'cache-first':
            return cacheFirst(cacheKey, networkFetcher, options === null || options === void 0 ? void 0 : options.cache);
        case 'network-first':
            return networkFirst(cacheKey, networkFetcher, options === null || options === void 0 ? void 0 : options.cache);
        case 'stale-while-revalidate':
            return staleWhileRevalidate(cacheKey, networkFetcher, options === null || options === void 0 ? void 0 : options.cache);
        case 'network-only':
            return networkOnly(cacheKey, networkFetcher, options === null || options === void 0 ? void 0 : options.cache);
        case 'cache-only':
            return cacheOnly(cacheKey);
        default:
            return cacheFirst(cacheKey, networkFetcher, options === null || options === void 0 ? void 0 : options.cache);
    }
}
