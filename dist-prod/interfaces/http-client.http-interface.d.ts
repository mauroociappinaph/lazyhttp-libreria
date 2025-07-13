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
import { RequestOptions, ApiResponse, AuthConfig, UserCredentials, AuthInfo, CacheConfig } from '../http.types';
