import { HttpImplementation, RequestOptions, ApiResponse, AuthConfig, UserCredentials, AuthInfo, CacheConfig, MetricsConfig, ProxyConfig, StreamConfig } from './http.types';
export declare const http: HttpImplementation & {
    configureCaching: (config: CacheConfig) => void;
    invalidateCache: (pattern: string) => void;
    invalidateCacheByTags: (tags: string[]) => void;
    configureMetrics: (config: MetricsConfig) => void;
    trackActivity: (type: string) => void;
    getCurrentMetrics: () => any;
    _baseUrl?: string;
    _frontendUrl?: string;
    _defaultTimeout?: number;
    _defaultRetries?: number;
    _defaultHeaders?: Record<string, string>;
    _requestInterceptors: Array<(config: any) => any>;
    _responseInterceptors: Array<(response: any) => any>;
    _setupInterceptors: {
        (): void;
        (interceptor?: any, type?: "request" | "response"): void;
    };
    _proxyConfig?: ProxyConfig;
    _defaultStreamConfig?: StreamConfig;
};
export declare const request: <T>(endpoint: string, options?: RequestOptions) => Promise<ApiResponse<T>>;
export declare const get: <T>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">) => Promise<ApiResponse<T>>;
export declare const getAll: <T>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">) => Promise<ApiResponse<T>>;
export declare const getById: <T>(endpoint: string, id: string, options?: Omit<RequestOptions, "method" | "body">) => Promise<ApiResponse<T>>;
export declare const post: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) => Promise<ApiResponse<T>>;
export declare const put: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) => Promise<ApiResponse<T>>;
export declare const patch: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) => Promise<ApiResponse<T>>;
export declare const del: <T>(endpoint: string, options?: Omit<RequestOptions, "method">) => Promise<ApiResponse<T>>;
export declare const configureAuth: (config: AuthConfig) => void;
export declare const login: (credentials: UserCredentials) => Promise<AuthInfo>;
export declare const logout: () => Promise<void>;
export declare const isAuthenticated: () => boolean;
export declare const getAuthenticatedUser: () => Promise<any | null>;
export declare const getAccessToken: () => string | null;
export declare const configureCaching: ((config: CacheConfig) => void) & ((config: CacheConfig) => void);
export declare const invalidateCache: ((pattern: string) => void) & ((pattern: string) => void);
export declare const invalidateCacheByTags: ((tags: string[]) => void) & ((tags: string[]) => void);
export declare const initialize: (config?: {
    suggestionService?: {
        enabled: boolean;
        url: string;
    };
    cache?: CacheConfig;
}) => Promise<void>;
export declare const configureMetrics: (config: MetricsConfig) => void;
export declare const trackActivity: (type: string) => void;
export declare const getCurrentMetrics: () => any;
