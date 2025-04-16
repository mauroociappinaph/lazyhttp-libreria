import { ProxyConfig, RequestOptions, StreamConfig } from './http.types';
export declare class HttpStreamingManager {
    private defaultStreamConfig?;
    private proxyConfig?;
    private baseUrl?;
    private defaultTimeout;
    configure(config: {
        streamConfig?: StreamConfig;
        proxyConfig?: ProxyConfig;
        baseUrl?: string;
        timeout?: number;
    }): void;
    stream<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ReadableStream<T>>;
    private createProxyAgent;
    private buildUrl;
    private prepareHeaders;
}
export declare const streamingManager: HttpStreamingManager;
