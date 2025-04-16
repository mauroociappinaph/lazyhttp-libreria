import { CacheConfig, MetricsConfig, ProxyConfig, StreamConfig } from './http.types';
export declare class HttpConfiguration {
    baseUrl?: string;
    frontendUrl?: string;
    defaultTimeout: number;
    defaultRetries: number;
    defaultHeaders: Record<string, string>;
    proxyConfig?: ProxyConfig;
    streamConfig?: StreamConfig;
    initialize(config?: {
        baseUrl?: string;
        frontendUrl?: string;
        suggestionService?: {
            enabled: boolean;
            url: string;
        };
        cache?: CacheConfig;
        metrics?: MetricsConfig;
        timeout?: number;
        retries?: number;
        headers?: Record<string, string>;
        proxy?: ProxyConfig;
        stream?: StreamConfig;
    }): Promise<void>;
    configureCaching(config: CacheConfig): void;
    invalidateCache(pattern: string): void;
    invalidateCacheByTags(tags: string[]): void;
    configureMetrics(config: MetricsConfig): void;
    trackActivity(type: string): void;
    getCurrentMetrics(): any;
    configureProxy(config: ProxyConfig): void;
    configureStream(config: StreamConfig): void;
}
export declare const httpConfiguration: HttpConfiguration;
