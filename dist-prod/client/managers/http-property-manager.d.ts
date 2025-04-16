import { HttpCore } from '../../http-core';
import { ProxyConfig, StreamConfig } from '../../http.types';
export declare class HttpPropertyManager {
    private core;
    constructor(core: HttpCore);
    get baseUrl(): string | undefined;
    set baseUrl(url: string | undefined);
    get frontendUrl(): string | undefined;
    set frontendUrl(url: string | undefined);
    get defaultTimeout(): number;
    set defaultTimeout(timeout: number);
    get defaultRetries(): number;
    set defaultRetries(retries: number);
    get defaultHeaders(): Record<string, string>;
    set defaultHeaders(headers: Record<string, string>);
    get proxyConfig(): ProxyConfig | undefined;
    set proxyConfig(config: ProxyConfig | undefined);
    get streamConfig(): StreamConfig | undefined;
    set streamConfig(config: StreamConfig | undefined);
    syncCoreSettings(): void;
    updateFromConfig(config?: {
        baseUrl?: string;
        timeout?: number;
        retries?: number;
        headers?: Record<string, string>;
    }): void;
}
