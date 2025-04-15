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
const cacheState = {
    config: {
        enabled: false,
        defaultStrategy: 'cache-first',
        defaultTTL: 5 * 60 * 1000,
        storage: 'memory',
        maxSize: 100
    },
    cache: new Map()
};
function configure(config) {
    cacheState.config = { ...cacheState.config, ...config };
    if (!cacheState.config.enabled) {
        clear();
    }
}
function isEnabled() {
    return cacheState.config.enabled;
}
function generateCacheKey(endpoint, options) {
    var _a, _b;
    if ((_a = options === null || options === void 0 ? void 0 : options.cache) === null || _a === void 0 ? void 0 : _a.key) {
        return options.cache.key;
    }
    let normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    if (options === null || options === void 0 ? void 0 : options.params) {
        const params = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
            params.append(key, String(value));
        });
        normalizedEndpoint += `?${params.toString()}`;
    }
    const method = (options === null || options === void 0 ? void 0 : options.method) || 'GET';
    let tagsString = '';
    if (((_b = options === null || options === void 0 ? void 0 : options.cache) === null || _b === void 0 ? void 0 : _b.tags) && options.cache.tags.length > 0) {
        tagsString = `:tags=${options.cache.tags.sort().join(',')}`;
    }
    return `${method}:${normalizedEndpoint}${tagsString}`;
}
function get(key) {
    const entry = cacheState.cache.get(key);
    if (!entry) {
        return undefined;
    }
    if (Date.now() > entry.expiresAt) {
        remove(key);
        return undefined;
    }
    entry.lastAccessed = Date.now();
    cacheState.cache.set(key, entry);
    return entry.value;
}
function set(key, value, options) {
    var _a, _b;
    if (!cacheState.config.enabled) {
        return;
    }
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
function remove(key) {
    cacheState.cache.delete(key);
}
function clear() {
    cacheState.cache.clear();
}
function invalidate(pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    for (const key of cacheState.cache.keys()) {
        if (regex.test(key)) {
            remove(key);
        }
    }
}
function invalidateByTags(tags) {
    for (const [key, entry] of cacheState.cache.entries()) {
        if (entry.tags && entry.tags.some(tag => tags.includes(tag))) {
            remove(key);
        }
    }
}
function invalidateByMethod(method, endpoint) {
    if (method === 'GET') {
        return;
    }
    const basePath = endpoint.split('/').slice(0, -1).join('/') || endpoint;
    invalidate(`GET:${basePath}*`);
}
function shouldUseCache(method, options) {
    var _a;
    if (!cacheState.config.enabled) {
        return false;
    }
    if (((_a = options === null || options === void 0 ? void 0 : options.cache) === null || _a === void 0 ? void 0 : _a.enabled) === false) {
        return false;
    }
    return method === 'GET';
}
function getStrategy(options) {
    var _a;
    return ((_a = options === null || options === void 0 ? void 0 : options.cache) === null || _a === void 0 ? void 0 : _a.strategy) || cacheState.config.defaultStrategy;
}
function evictOldEntries() {
    const entries = Array.from(cacheState.cache.entries())
        .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
    const toRemove = Math.ceil(cacheState.config.maxSize * 0.1);
    entries.slice(0, toRemove).forEach(([key]) => remove(key));
}
exports.cacheManager = {
    configure,
    isEnabled,
    generateCacheKey,
    get,
    set,
    delete: remove,
    clear,
    invalidate,
    invalidateByTags,
    invalidateByMethod,
    shouldUseCache,
    getStrategy
};
