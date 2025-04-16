import { CacheConfig, MetricsConfig, ProxyConfig, StreamConfig } from '../../http.types';
import { HttpPropertyManager } from './http-property-manager';
export declare class HttpConfigManager {
    private propertyManager;
    constructor(propertyManager: HttpPropertyManager);
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
}
