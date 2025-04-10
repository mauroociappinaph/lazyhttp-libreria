import { ApiResponse, CacheConfig, CacheOptions, CacheStrategy, HttpMethod, RequestOptions } from './http.types';
/**
 * Configura el sistema de caché
 */
export declare function configure(config: Partial<CacheConfig>): void;
/**
 * Verifica si la caché está habilitada
 */
export declare function isEnabled(): boolean;
/**
 * Genera una clave de caché a partir de un endpoint y opciones
 */
export declare function generateCacheKey(endpoint: string, options?: RequestOptions): string;
/**
 * Obtiene una entrada de la caché
 */
export declare function get<T>(key: string): ApiResponse<T> | undefined;
/**
 * Almacena un valor en la caché
 */
export declare function set<T>(key: string, value: ApiResponse<T>, options?: CacheOptions): void;
/**
 * Elimina una entrada de la caché
 */
export declare function remove(key: string): void;
/**
 * Limpia toda la caché
 */
export declare function clear(): void;
/**
 * Invalida entradas de caché que coincidan con un patrón
 */
export declare function invalidate(pattern: string): void;
/**
 * Invalida entradas de caché con ciertos tags
 */
export declare function invalidateByTags(tags: string[]): void;
/**
 * Invalida automáticamente caché basado en método HTTP
 */
export declare function invalidateByMethod(method: HttpMethod, endpoint: string): void;
/**
 * Debería usar caché para esta petición?
 */
export declare function shouldUseCache(method: HttpMethod, options?: RequestOptions): boolean;
/**
 * Obtiene la estrategia de caché a utilizar
 */
export declare function getStrategy(options?: RequestOptions): CacheStrategy;
export declare const cacheManager: {
    configure: typeof configure;
    isEnabled: typeof isEnabled;
    generateCacheKey: typeof generateCacheKey;
    get: typeof get;
    set: typeof set;
    delete: typeof remove;
    clear: typeof clear;
    invalidate: typeof invalidate;
    invalidateByTags: typeof invalidateByTags;
    invalidateByMethod: typeof invalidateByMethod;
    shouldUseCache: typeof shouldUseCache;
    getStrategy: typeof getStrategy;
};
