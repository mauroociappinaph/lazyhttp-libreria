import { ApiResponse } from '../core/response.types';
export type CacheStrategy = 'cache-first' | 'network-first' | 'stale-while-revalidate' | 'network-only' | 'cache-only';
export type CacheStorageType = 'memory' | 'localStorage' | 'indexedDB';
export interface CacheOptions {
    enabled?: boolean;
    strategy?: CacheStrategy;
    ttl?: number;
    key?: string;
    tags?: string[];
}
export interface CacheConfig {
    enabled: boolean;
    defaultStrategy?: CacheStrategy;
    defaultTTL?: number;
    storage?: CacheStorageType;
    maxSize?: number;
}
export interface CacheEntry<T> {
    value: ApiResponse<T>;
    expiresAt: number;
    createdAt: number;
    lastAccessed: number;
    tags?: string[];
}
