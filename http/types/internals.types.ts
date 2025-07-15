import { AxiosResponse } from 'axios';
import { HttpMethod, ApiResponse, RequestOptions, HttpClient } from './core.types';
import { ProxyConfig } from './proxy.types';

export interface InternalHttpClient extends HttpClient {
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

export interface HttpResponseProcessor {
  processResponse<T>(
    response: AxiosResponse<T>,
    metaOpcional?: {
      requestHeaders?: Record<string, string>;
      timing?: Record<string, number>;
      rawBody?: string | Uint8Array;
    }
  ): ApiResponse<T>;
}

export interface HttpRequestExecutor {
  executeRequest<T>(
    endpoint: string,
    method: HttpMethod,
    headers: Record<string, string>,
    body: unknown | undefined,
    signal: AbortSignal
  ): Promise<AxiosResponse<T>>;
}

export interface HttpRetryHandler {
  executeWithRetry<T>(
    endpoint: string,
    method: HttpMethod,
    headers: Record<string, string>,
    body: unknown | undefined,
    timeout: number,
    retriesLeft: number,
    metaOpcional?: {
      requestStart?: number;
    }
  ): Promise<ApiResponse<T>>;
  handleRetry<T>(
    error: unknown,
    retryCallback: () => Promise<ApiResponse<T>>,
    retriesLeft: number
  ): Promise<ApiResponse<T>>;
  isRetryableError(error: unknown): boolean;
  waitForRetry(retriesLeft: number): Promise<void>;
}

export interface HttpErrorHandler {
  handleError(error: unknown): ApiResponse<never>;
}
