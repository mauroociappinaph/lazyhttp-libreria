"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheManager = void 0;
exports.configure = configure;
exports.isEnabled = isEnabled;
exports.generateCacheKey = generateCacheKey;
exports.get = get;
exports.set = set;
exports.remove = remove;
exports.clear = clear;
exports.invalidate = invalidate;
exports.invalidateByTags = invalidateByTags;
exports.invalidateByMethod = invalidateByMethod;
exports.shouldUseCache = shouldUseCache;
exports.getStrategy = getStrategy;
// Estado interno del caché
const cacheState = {
    config: {
        enabled: false,
        defaultStrategy: 'cache-first',
        defaultTTL: 5 * 60 * 1000, // 5 minutos
        storage: 'memory',
        maxSize: 100
    },
    cache: new Map()
};
/**
 * Configura el sistema de caché
 */
function configure(config) {
    cacheState.config = { ...cacheState.config, ...config };
    // Si se deshabilita la caché, limpiarla
    if (!cacheState.config.enabled) {
        clear();
    }
}
/**
 * Verifica si la caché está habilitada
 */
function isEnabled() {
    return cacheState.config.enabled;
}
/**
 * Genera una clave de caché a partir de un endpoint y opciones
 */
function generateCacheKey(endpoint, options) {
    var _a, _b;
    if ((_a = options === null || options === void 0 ? void 0 : options.cache) === null || _a === void 0 ? void 0 : _a.key) {
        return options.cache.key;
    }
    // Normalizar el endpoint
    let normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    // Incluir parámetros en la clave si existen
    if (options === null || options === void 0 ? void 0 : options.params) {
        const params = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
            params.append(key, String(value));
        });
        normalizedEndpoint += `?${params.toString()}`;
    }
    // Incluir método en la clave (por defecto es GET)
    const method = (options === null || options === void 0 ? void 0 : options.method) || 'GET';
    // Incluir tags en la clave si existen
    let tagsString = '';
    if (((_b = options === null || options === void 0 ? void 0 : options.cache) === null || _b === void 0 ? void 0 : _b.tags) && options.cache.tags.length > 0) {
        tagsString = `:tags=${options.cache.tags.sort().join(',')}`;
    }
    return `${method}:${normalizedEndpoint}${tagsString}`;
}
/**
 * Obtiene una entrada de la caché
 */
function get(key) {
    const entry = cacheState.cache.get(key);
    if (!entry) {
        return undefined;
    }
    // Verificar si ha expirado
    if (Date.now() > entry.expiresAt) {
        remove(key);
        return undefined;
    }
    // Actualizar timestamp de último acceso
    entry.lastAccessed = Date.now();
    cacheState.cache.set(key, entry);
    return entry.value;
}
/**
 * Almacena un valor en la caché
 */
function set(key, value, options) {
    var _a, _b;
    if (!cacheState.config.enabled) {
        return;
    }
    // Si se alcanza el tamaño máximo, eliminar las entradas más antiguas
    if (cacheState.cache.size >= cacheState.config.maxSize) {
        evictOldEntries();
    }
    const ttl = (_a = options === null || options === void 0 ? void 0 : options.ttl) !== null && _a !== void 0 ? _a : cacheState.config.defaultTTL;
    const tags = (_b = options === null || options === void 0 ? void 0 : options.tags) !== null && _b !== void 0 ? _b : [];
    const entry = {
        value,
        expiresAt: Date.now() + ttl,
        createdAt: Date.now(),
        lastAccessed: Date.now(),
        tags
    };
    cacheState.cache.set(key, entry);
}
/**
 * Elimina una entrada de la caché
 */
function remove(key) {
    cacheState.cache.delete(key);
}
/**
 * Limpia toda la caché
 */
function clear() {
    cacheState.cache.clear();
}
/**
 * Invalida entradas de caché que coincidan con un patrón
 */
function invalidate(pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    for (const key of cacheState.cache.keys()) {
        if (regex.test(key)) {
            remove(key);
        }
    }
}
/**
 * Invalida entradas de caché con ciertos tags
 */
function invalidateByTags(tags) {
    for (const [key, entry] of cacheState.cache.entries()) {
        if (entry.tags && entry.tags.some(tag => tags.includes(tag))) {
            remove(key);
        }
    }
}
/**
 * Invalida automáticamente caché basado en método HTTP
 */
function invalidateByMethod(method, endpoint) {
    if (method === 'GET') {
        return; // GET no invalida caché
    }
    // Extraer recurso base (e.g., /users/1 -> /users)
    const basePath = endpoint.split('/').slice(0, -1).join('/') || endpoint;
    // POST/PUT/PATCH/DELETE en un recurso invalida colecciones y elementos
    invalidate(`GET:${basePath}*`);
}
/**
 * Debería usar caché para esta petición?
 */
function shouldUseCache(method, options) {
    var _a;
    // Si la caché está deshabilitada globalmente
    if (!cacheState.config.enabled) {
        return false;
    }
    // Si la petición específica desactiva la caché
    if (((_a = options === null || options === void 0 ? void 0 : options.cache) === null || _a === void 0 ? void 0 : _a.enabled) === false) {
        return false;
    }
    // Solo se cachean peticiones GET por defecto
    return method === 'GET';
}
/**
 * Obtiene la estrategia de caché a utilizar
 */
function getStrategy(options) {
    var _a;
    return ((_a = options === null || options === void 0 ? void 0 : options.cache) === null || _a === void 0 ? void 0 : _a.strategy) || cacheState.config.defaultStrategy;
}
/**
 * Elimina las entradas más antiguas para hacer espacio
 */
function evictOldEntries() {
    // Ordenar por último acceso (más antiguo primero)
    const entries = Array.from(cacheState.cache.entries())
        .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
    // Eliminar el 10% más antiguo
    const toRemove = Math.ceil(cacheState.config.maxSize * 0.1);
    entries.slice(0, toRemove).forEach(([key]) => remove(key));
}
// Exportar todo en un objeto para mantener compatibilidad con la API anterior
exports.cacheManager = {
    configure,
    isEnabled,
    generateCacheKey,
    get,
    set,
    delete: remove, // Renombrar para evitar colisión con keyword
    clear,
    invalidate,
    invalidateByTags,
    invalidateByMethod,
    shouldUseCache,
    getStrategy
};
