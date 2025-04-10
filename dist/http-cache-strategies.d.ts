import { ApiResponse, CacheOptions, RequestOptions } from './http.types';
/**
 * Tipo para una función de red que obtiene datos
 */
export type NetworkFetcher<T> = () => Promise<ApiResponse<T>>;
/**
 * Ejecuta una estrategia cache-first
 * Intenta usar caché, si no existe o expiró va a la red
 */
export declare function cacheFirst<T>(cacheKey: string, networkFetcher: NetworkFetcher<T>, options?: CacheOptions): Promise<ApiResponse<T>>;
/**
 * Ejecuta una estrategia network-first
 * Intenta usar la red, si falla usa caché
 */
export declare function networkFirst<T>(cacheKey: string, networkFetcher: NetworkFetcher<T>, options?: CacheOptions): Promise<ApiResponse<T>>;
/**
 * Ejecuta una estrategia stale-while-revalidate
 * Usa caché mientras refresca en segundo plano
 */
export declare function staleWhileRevalidate<T>(cacheKey: string, networkFetcher: NetworkFetcher<T>, options?: CacheOptions): Promise<ApiResponse<T>>;
/**
 * Ejecuta una estrategia network-only
 * Solo usa la red, nunca la caché
 */
export declare function networkOnly<T>(cacheKey: string, networkFetcher: NetworkFetcher<T>, options?: CacheOptions): Promise<ApiResponse<T>>;
/**
 * Ejecuta una estrategia cache-only
 * Solo usa la caché, nunca la red
 */
export declare function cacheOnly<T>(cacheKey: string): Promise<ApiResponse<T>>;
/**
 * Ejecuta la estrategia de caché apropiada según las opciones
 */
export declare function executeWithCacheStrategy<T>(cacheKey: string, networkFetcher: NetworkFetcher<T>, options?: RequestOptions): Promise<ApiResponse<T>>;
