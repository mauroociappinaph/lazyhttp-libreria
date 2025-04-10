"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheFirst = cacheFirst;
exports.networkFirst = networkFirst;
exports.staleWhileRevalidate = staleWhileRevalidate;
exports.networkOnly = networkOnly;
exports.cacheOnly = cacheOnly;
exports.executeWithCacheStrategy = executeWithCacheStrategy;
const cache = __importStar(require("./http-cache"));
/**
 * Ejecuta una estrategia cache-first
 * Intenta usar caché, si no existe o expiró va a la red
 */
async function cacheFirst(cacheKey, networkFetcher, options) {
    // Intentar obtener de caché
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
        return cachedResponse;
    }
    // Si no está en caché o expiró, obtener de la red
    try {
        const response = await networkFetcher();
        // Guardar en caché solo si la respuesta fue exitosa
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
/**
 * Ejecuta una estrategia network-first
 * Intenta usar la red, si falla usa caché
 */
async function networkFirst(cacheKey, networkFetcher, options) {
    try {
        // Intentar obtener de la red
        const response = await networkFetcher();
        // Guardar en caché solo si la respuesta fue exitosa
        if (!response.error) {
            cache.set(cacheKey, response, options);
        }
        return response;
    }
    catch (error) {
        // En caso de error, intentar usar caché
        const cachedResponse = cache.get(cacheKey);
        if (cachedResponse) {
            // Agregar un metadata para indicar que se está usando caché
            return {
                ...cachedResponse,
                meta: {
                    ...(cachedResponse.meta || {}),
                    fromCache: true,
                    networkError: String(error)
                }
            };
        }
        // Si no hay caché, devolver error
        return {
            data: null,
            error: `Error obteniendo datos: ${error instanceof Error ? error.message : String(error)}`,
            status: 0
        };
    }
}
/**
 * Ejecuta una estrategia stale-while-revalidate
 * Usa caché mientras refresca en segundo plano
 */
async function staleWhileRevalidate(cacheKey, networkFetcher, options) {
    // Intentar obtener de caché
    const cachedResponse = cache.get(cacheKey);
    // Actualizar en segundo plano sin esperar
    const updateCache = async () => {
        try {
            const freshResponse = await networkFetcher();
            // Guardar en caché solo si la respuesta fue exitosa
            if (!freshResponse.error) {
                cache.set(cacheKey, freshResponse, options);
            }
        }
        catch (error) {
            // Ignorar errores en la actualización en segundo plano
            console.warn(`Error actualizando caché: ${error}`);
        }
    };
    // Si hay datos en caché, devolver inmediatamente y actualizar en segundo plano
    if (cachedResponse) {
        // No esperamos que termine la actualización
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
    // Si no hay datos en caché, esperar la red
    try {
        const response = await networkFetcher();
        // Guardar en caché solo si la respuesta fue exitosa
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
/**
 * Ejecuta una estrategia network-only
 * Solo usa la red, nunca la caché
 */
async function networkOnly(cacheKey, networkFetcher, options) {
    try {
        const response = await networkFetcher();
        // Guardar en caché solo si la respuesta fue exitosa y está configurado para ello
        // Esto puede ser útil para la invalidación automática
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
/**
 * Ejecuta una estrategia cache-only
 * Solo usa la caché, nunca la red
 */
async function cacheOnly(cacheKey) {
    // Intentar obtener de caché
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
        return cachedResponse;
    }
    // Si no hay datos en caché, devolver error
    return {
        data: null,
        error: 'No hay datos en caché',
        status: 404
    };
}
/**
 * Ejecuta la estrategia de caché apropiada según las opciones
 */
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
            // Si por alguna razón la estrategia no es válida, usar cache-first como fallback
            return cacheFirst(cacheKey, networkFetcher, options === null || options === void 0 ? void 0 : options.cache);
    }
}
