import { ApiResponse } from './response.types';
import { HttpMethod } from './http-methods.types';
import { AxiosResponse } from 'axios';
export interface HttpRequestExecutor {
    executeRequest<T>(endpoint: string, method: HttpMethod, headers: Record<string, string>, body: unknown | undefined, signal: AbortSignal): Promise<AxiosResponse<T>>;
}
export interface HttpRetryHandler {
    executeWithRetry<T>(endpoint: string, method: HttpMethod, headers: Record<string, string>, body: unknown | undefined, timeout: number, retriesLeft: number): Promise<ApiResponse<T>>;
    handleRetry<T>(error: unknown, retryCallback: () => Promise<ApiResponse<T>>, retriesLeft: number): Promise<ApiResponse<T>>;
    isRetryableError(error: unknown): boolean;
    waitForRetry(retriesLeft: number): Promise<void>;
}
