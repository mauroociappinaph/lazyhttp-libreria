export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
import { CacheOptions } from '../cache/cache.types';
import { StreamConfig } from '../streaming/streaming.types';
interface ProxyConfig {
    url: string;
    auth?: {
        username: string;
        password: string;
    };
    protocol?: 'http' | 'https' | 'socks';
    rejectUnauthorized?: boolean;
}
export interface RequestOptions {
    method?: HttpMethod;
    headers?: Record<string, string>;
    body?: unknown;
    withAuth?: boolean;
    timeout?: number;
    retries?: number;
    params?: Record<string, string | number>;
    cache?: CacheOptions;
    proxy?: ProxyConfig;
    stream?: StreamConfig;
}
export interface ErrorResponse {
    message?: string;
    code?: string;
}
export {};
