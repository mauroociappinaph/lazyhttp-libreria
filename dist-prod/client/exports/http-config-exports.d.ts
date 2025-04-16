export declare const initialize: (config?: {
    suggestionService?: {
        enabled: boolean;
        url: string;
    };
    cache?: import("../../http.types").CacheConfig;
}) => Promise<void>;
export declare const configureCaching: ((config: import("../../http.types").CacheConfig) => void) & ((config: import("../../http.types").CacheConfig) => void);
export declare const invalidateCache: ((pattern: string) => void) & ((pattern: string) => void);
export declare const invalidateCacheByTags: ((tags: string[]) => void) & ((tags: string[]) => void);
export declare const configureMetrics: (config: import("../../http.types").MetricsConfig) => void;
export declare const trackActivity: (type: string) => void;
export declare const getCurrentMetrics: () => any;
