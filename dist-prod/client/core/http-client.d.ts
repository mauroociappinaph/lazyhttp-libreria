import { SocksProxyAgent } from 'socks-proxy-agent';
import { HttpImplementation, RequestOptions, ApiResponse, AuthConfig, UserCredentials, AuthInfo, ProxyConfig, StreamConfig } from '../../http.types';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { HttpOperations } from './http-operations';
export declare class HttpClient implements HttpImplementation, HttpOperations {
    private core;
    private propertyManager;
    private authManager;
    private configManager;
    constructor();
    private initResourceAccessors;
    get _baseUrl(): string | undefined;
    set _baseUrl(url: string | undefined);
    get _frontendUrl(): string | undefined;
    set _frontendUrl(url: string | undefined);
    get _defaultTimeout(): number;
    set _defaultTimeout(timeout: number);
    get _defaultRetries(): number;
    set _defaultRetries(retries: number);
    get _defaultHeaders(): Record<string, string>;
    set _defaultHeaders(headers: Record<string, string>);
    get _requestInterceptors(): Array<(config: any) => any>;
    get _responseInterceptors(): Array<(response: any) => any>;
    get _proxyConfig(): ProxyConfig | undefined;
    set _proxyConfig(config: ProxyConfig | undefined);
    get _defaultStreamConfig(): StreamConfig | undefined;
    set _defaultStreamConfig(config: StreamConfig | undefined);
    request<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>>;
    getMethod<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
    getAllMethod<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
    getByIdMethod<T>(endpoint: string, id: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
    postMethod<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
    putMethod<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
    patchMethod<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
    deleteMethod<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>>;
    streamMethod<T = unknown>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ReadableStream<T>>;
    get: F & {
        [resource: string]: F;
    };
    getAll: F & {
        [resource: string]: F;
    };
    getById: F & {
        [resource: string]: F;
    };
    post: F & {
        [resource: string]: F;
    };
    put: F & {
        [resource: string]: F;
    };
    patch: F & {
        [resource: string]: F;
    };
    delete: F & {
        [resource: string]: F;
    };
    stream: F & {
        [resource: string]: F;
    };
    _setupInterceptors(interceptor?: any, type?: 'request' | 'response'): void;
    configureAuth(config: AuthConfig): void;
    login(credentials: UserCredentials): Promise<AuthInfo>;
    logout(): Promise<void>;
    isAuthenticated(): boolean;
    getAuthenticatedUser(): Promise<any | null>;
    getAccessToken(): string | null;
    _refreshToken(): Promise<string>;
    _handleRefreshTokenFailure(): Promise<void>;
    _decodeToken(token: string): any;
    _isTokenExpired(token: string | number): boolean;
    _storeToken(key: string, value: string): void;
    _getToken(key: string): string | null;
    _removeToken(key: string): void;
    initialize(config?: {
        baseUrl?: string;
        frontendUrl?: string;
        suggestionService?: {
            enabled: boolean;
            url: string;
        };
        cache?: any;
        metrics?: any;
        timeout?: number;
        retries?: number;
        headers?: Record<string, string>;
        proxy?: ProxyConfig;
        stream?: StreamConfig;
    }): Promise<void>;
    configureCaching(config: any): void;
    invalidateCache(pattern: string): void;
    invalidateCacheByTags(tags: string[]): void;
    configureMetrics(config: any): void;
    trackActivity(type: string): void;
    getCurrentMetrics(): any;
    configureProxy(config: ProxyConfig): void;
    _buildUrl(endpoint: string): string;
    _prepareHeaders(options: RequestOptions): Record<string, string>;
    _createProxyAgent(proxyConfig?: ProxyConfig): SocksProxyAgent | HttpsProxyAgent<string> | undefined;
    logger: import("../../http-logger").HttpLogger;
}
type F = (...args: any[]) => any;
export {};
