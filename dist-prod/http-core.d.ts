import { RequestOptions, ApiResponse } from './http.types';
export declare class HttpCore {
    _baseUrl?: string;
    _frontendUrl?: string;
    _defaultTimeout: number;
    _defaultRetries: number;
    _defaultHeaders: Record<string, string>;
    request<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>>;
    private performRequest;
    get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
    getAll<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
    getById<T>(endpoint: string, id: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
    post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
    put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
    patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
    delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>>;
}
