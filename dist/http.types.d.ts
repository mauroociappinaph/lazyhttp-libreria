import { AxiosResponse } from 'axios';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
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
export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
    status: number;
    code?: string;
    meta?: Record<string, any>;
    details?: {
        description: string;
        cause: string;
        solution: string;
        example?: string;
    };
}
export interface HttpClient {
    request<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>>;
    get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
    getAll<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
    getById<T>(endpoint: string, id: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
    post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
    put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
    patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
    delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>>;
    initialize(config?: {
        suggestionService?: {
            enabled: boolean;
            url: string;
        };
        cache?: CacheConfig;
    }): Promise<void>;
    configureAuth(config: AuthConfig): void;
    login(credentials: UserCredentials): Promise<AuthInfo>;
    logout(): Promise<void>;
    isAuthenticated(): boolean;
    getAuthenticatedUser(): Promise<any | null>;
    getAccessToken(): string | null;
    configureCaching(config: CacheConfig): void;
    invalidateCache(pattern: string): void;
    invalidateCacheByTags(tags: string[]): void;
}
export interface HttpImplementation extends HttpClient {
    _setupInterceptors(): void;
    _refreshToken(): Promise<string>;
    _handleRefreshTokenFailure(): Promise<void>;
    _decodeToken(token: string): any;
    _isTokenExpired(token: string | number): boolean;
    _storeToken(key: string, value: string): void;
    _getToken(key: string): string | null;
    _removeToken(key: string): void;
    configureProxy(config: ProxyConfig): void;
    stream<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ReadableStream<T>>;
    _buildUrl(endpoint: string): string;
    _prepareHeaders(options: RequestOptions): Record<string, string>;
    _createProxyAgent(proxyConfig?: ProxyConfig): any;
}
export interface ErrorResponse {
    message?: string;
    code?: string;
}
export interface HttpResponseProcessor {
    processResponse<T>(response: AxiosResponse<T>): ApiResponse<T>;
}
export interface HttpRequestExecutor {
    executeRequest<T>(endpoint: string, method: HttpMethod, headers: Record<string, string>, body: unknown | undefined, signal: AbortSignal): Promise<AxiosResponse<T>>;
}
export interface HttpRetryHandler {
    executeWithRetry<T>(endpoint: string, method: HttpMethod, headers: Record<string, string>, body: unknown | undefined, timeout: number, retriesLeft: number): Promise<ApiResponse<T>>;
    handleRetry<T>(error: unknown, retryCallback: () => Promise<ApiResponse<T>>, retriesLeft: number): Promise<ApiResponse<T>>;
    isRetryableError(error: unknown): boolean;
    waitForRetry(retriesLeft: number): Promise<void>;
}
export interface HttpErrorHandler {
    handleError(error: unknown): ApiResponse<never>;
}
export interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
export interface ApiResponseWithPagination<T> extends ApiResponse<T> {
    pagination: PaginationMeta | null;
}
export type AuthType = 'jwt' | 'oauth2' | 'basic' | 'session';
export interface CookieOptions {
    maxAge?: number;
    expires?: Date;
    domain?: string;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
}
export type StorageType = 'cookie' | 'localStorage' | 'sessionStorage';
export interface AuthConfig {
    baseURL: string;
    loginEndpoint: string;
    logoutEndpoint: string;
    userInfoEndpoint?: string;
    refreshEndpoint?: string;
    tokenKey: string;
    refreshTokenKey: string;
    storage: StorageType;
    cookieOptions?: CookieOptions;
    onLogin?: (response: AuthResponse) => void;
    onLogout?: () => void;
    onError?: (error: any) => void;
}
export interface UserCredentials {
    username: string;
    password: string;
    [key: string]: any;
}
export interface AuthInfo {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: number;
    user?: any;
    isAuthenticated: boolean;
}
export interface AuthResponse {
    access_token: string;
    refresh_token?: string;
    token_type?: string;
    expires_in?: number;
}
export interface ErrorDetails {
    description: string;
    cause: string;
    solution: string;
    example?: string;
}
export declare class HttpError extends Error {
    suggestion?: string;
    details?: ErrorDetails;
    static ERROR_MESSAGES: Record<string, string>;
}
export interface ErrorInfo {
    error_type: string;
    status_code?: number;
    url_pattern?: string;
    method?: string;
    message?: string;
}
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
export interface SessionMetrics {
    loginTime: number;
    lastActivity: number;
    activeTime: number;
    logoutTime?: number;
    requestCount: number;
    activities: Record<string, number>;
    visitedRoutes: string[];
    sessionId: string;
}
export interface MetricsConfig {
    enabled: boolean;
    endpoint?: string;
    reportingInterval?: number;
    trackRoutes?: boolean;
    trackEvents?: string[];
    onMetricsUpdate?: (metrics: SessionMetrics) => void;
}
export interface ProxyConfig {
    url: string;
    auth?: {
        username: string;
        password: string;
    };
    protocol?: 'http' | 'https' | 'socks';
    rejectUnauthorized?: boolean;
}
export interface StreamConfig {
    enabled?: boolean;
    chunkSize?: number;
    onChunk?: (chunk: any) => void;
    onEnd?: () => void;
    onError?: (error: Error) => void;
}
