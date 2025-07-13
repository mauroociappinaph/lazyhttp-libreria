import { AxiosInstance } from 'axios';
import { RequestOptions } from '../../http.types';
export interface SoaClientConfig {
    serviceUrl: string;
    namespace?: string;
    timeout?: number;
    headers?: Record<string, string>;
    axiosInstance?: AxiosInstance;
    withAuth?: boolean;
}
export interface SoaServerConfig {
    port?: number;
    services: Record<string, Record<string, (...args: any[]) => Promise<any>>>;
    path?: string;
    cors?: boolean;
}
export interface SoaClient {
    callService<T = any>(serviceName: string, method: string, params: any, options?: RequestOptions): Promise<T>;
    callBatch<T = any>(calls: Array<{
        serviceName: string;
        method: string;
        params: any;
    }>, options?: RequestOptions): Promise<T[]>;
    getServiceDefinition(serviceName: string): Promise<any>;
    close(): void;
}
export interface SoaServer {
    start(): Promise<void>;
    stop(): Promise<void>;
    getRegisteredServices(): string[];
    addService(name: string, implementation: Record<string, (...args: any[]) => Promise<any>>): void;
    removeService(name: string): boolean;
}
export declare function createSoaClient(config: SoaClientConfig): SoaClient;
export declare function createSoaServer(config: SoaServerConfig): SoaServer;
