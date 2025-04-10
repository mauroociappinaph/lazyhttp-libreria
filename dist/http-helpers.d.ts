import { HttpMethod, ApiResponse, HttpResponseProcessor, HttpRequestExecutor, HttpRetryHandler, HttpErrorHandler } from './http.types';
import { AxiosResponse } from 'axios';
export declare const logger: {
    /**
     * Registra un mensaje con nivel de error
     * @param message Mensaje principal
     * @param data Datos adicionales para incluir en el log
     */
    error(message: string, data?: unknown): void;
    /**
     * Registra un mensaje con nivel de advertencia
     * @param message Mensaje principal
     * @param data Datos adicionales para incluir en el log
     */
    warn(message: string, data?: unknown): void;
    /**
     * Registra un mensaje con nivel de información
     * @param message Mensaje principal
     * @param data Datos adicionales para incluir en el log
     */
    info(message: string, data?: unknown): void;
    /**
     * Registra un mensaje con nivel de depuración
     * @param message Mensaje principal
     * @param data Datos adicionales para incluir en el log
     */
    debug(message: string, data?: unknown): void;
    /**
     * Método interno para registrar mensajes con formato
     */
    _log(level: "error" | "warning" | "info" | "debug", message: string, data?: unknown): void;
};
export declare const errorHandler: HttpErrorHandler;
export declare function logRequest(method: string, url: string, headers: Record<string, string>, body: unknown): void;
export declare function logResponse(response: AxiosResponse): void;
export declare function prepareHeaders(headers: Record<string, string>, withAuth: boolean): Record<string, string>;
export declare const requestExecutor: HttpRequestExecutor;
export declare const responseProcessor: HttpResponseProcessor;
export declare const retryHandler: HttpRetryHandler;
export declare function setupInterceptors(): void;
export declare function refreshToken(): Promise<string>;
export declare function handleRefreshTokenFailure(): Promise<void>;
export declare function initialize(): Promise<void>;
export declare const _handleError: (error: unknown) => ApiResponse<never>;
export declare const _executeRequest: <T>(endpoint: string, method: HttpMethod, headers: Record<string, string>, body: unknown | undefined, signal: AbortSignal) => Promise<AxiosResponse<T>>;
export declare const _processResponse: <T>(response: AxiosResponse<T>) => ApiResponse<T>;
export declare const _executeWithRetry: <T>(endpoint: string, method: HttpMethod, headers: Record<string, string>, body: unknown | undefined, timeout: number, retriesLeft: number) => Promise<ApiResponse<T>>;
export declare const _handleRetry: <T>(error: unknown, retryCallback: () => Promise<ApiResponse<T>>, retriesLeft: number) => Promise<ApiResponse<T>>;
export declare const _isRetryableError: (error: unknown) => boolean;
export declare const _waitForRetry: (retriesLeft: number) => Promise<void>;
export declare const _prepareHeaders: typeof prepareHeaders;
export declare const _logRequest: typeof logRequest;
export declare const _logResponse: typeof logResponse;
export declare const _setupInterceptors: typeof setupInterceptors;
export declare const _refreshToken: typeof refreshToken;
export declare const _handleRefreshTokenFailure: typeof handleRefreshTokenFailure;
