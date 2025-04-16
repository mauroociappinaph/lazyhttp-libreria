export { http } from './client/exports/http-exports';
export { HttpImplementation, RequestOptions, ApiResponse, HttpMethod, AuthConfig, UserCredentials, AuthInfo, ProxyConfig, StreamConfig, CacheConfig, MetricsConfig } from './http.types';
export { request, get, getAll, getById, post, put, patch, del } from './client/exports/http-methods';
export { configureAuth, login, logout, isAuthenticated, getAuthenticatedUser, getAccessToken } from './client/exports/http-auth-exports';
export { initialize, configureCaching, invalidateCache, invalidateCacheByTags, configureMetrics, trackActivity, getCurrentMetrics } from './client/exports/http-config-exports';
export { httpLogger, LoggerConfig } from './client/exports/http-logger-exports';
export * from './resources';
export declare const loadStreamingModule: () => Promise<{
    stream: <T>(endpoint: string, options?: Omit<import("./http.types").RequestOptions, "method" | "body">) => Promise<ReadableStream<T>>;
}>;
export declare const loadProxyModule: () => Promise<{
    configureProxy: (config: import("./http.types").ProxyConfig) => void;
}>;
