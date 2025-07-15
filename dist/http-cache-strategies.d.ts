import { ApiResponse, RequestOptions } from './types/core.types';
import { CacheOptions } from './types/cache.types';
export type NetworkFetcher<T> = () => Promise<ApiResponse<T>>;
export declare function cacheFirst<T>(cacheKey: string, networkFetcher: NetworkFetcher<T>, options?: CacheOptions): Promise<ApiResponse<T>>;
export declare function networkFirst<T>(cacheKey: string, networkFetcher: NetworkFetcher<T>, options?: CacheOptions): Promise<ApiResponse<T>>;
export declare function staleWhileRevalidate<T>(cacheKey: string, networkFetcher: NetworkFetcher<T>, options?: CacheOptions): Promise<ApiResponse<T>>;
export declare function networkOnly<T>(cacheKey: string, networkFetcher: NetworkFetcher<T>, options?: CacheOptions): Promise<ApiResponse<T>>;
export declare function cacheOnly<T>(cacheKey: string): Promise<ApiResponse<T>>;
export declare function executeWithCacheStrategy<T>(cacheKey: string, networkFetcher: NetworkFetcher<T>, options?: RequestOptions): Promise<ApiResponse<T>>;
