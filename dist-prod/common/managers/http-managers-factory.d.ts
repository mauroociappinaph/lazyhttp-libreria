import { CacheConfig, StreamConfig, MetricsConfig } from '../types';
export declare class HttpManagersFactory {
    static createCacheManager(config: CacheConfig): {
        enabled: boolean;
        ttl: number;
        maxSize: number;
        storage: "localStorage" | "sessionStorage" | "memory";
        generateCacheKey(method: string, url: string, data?: any): string;
        hashString(str: string): string;
        get: (_key: string) => any;
        set: (_key: string, _value: any, _ttl?: number) => void;
        has: (_key: string) => boolean;
        delete: (_key: string) => boolean;
        clear: () => void;
        invalidateByPattern: (_pattern: string) => void;
        invalidateByTags: (_tags: string[]) => void;
    };
    static createInterceptorsManager(): {
        setupInterceptors(interceptor?: any, type?: "request" | "response"): void;
        getRequestInterceptors(): Array<(config: any) => any>;
        getResponseInterceptors(): Array<(response: any) => any>;
        applyRequestInterceptors(config: any): any;
        applyResponseInterceptors(response: any): any;
    };
    static createMetricsManager(config: MetricsConfig): {
        enabled: boolean;
        trackErrors: true;
        trackPerformance: true;
        trackCache: true;
        trackRequest(_url: string): void;
        trackError(_error: any): void;
        trackResponseTime(time: number): void;
        trackCacheHit(): void;
        trackCacheMiss(): void;
        getMetrics(): any;
        trackActivity(_type: string): void;
    };
    static createStreamingManager(_config?: StreamConfig): {
        stream<T>(_url: string, _options: any): Promise<ReadableStream<T>>;
    };
}
