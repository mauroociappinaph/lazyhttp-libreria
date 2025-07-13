export * from '../common/types';
export * from '../common/utils/http-utils';
import { NodeHttpClient } from './core/node-http-client';
export declare const http: NodeHttpClient;
export declare const configureProxy: (config: import("../common/types").ProxyConfig) => void;
export declare const stream: <T>(url: string, config?: any) => Promise<ReadableStream<T>>;
export declare const createSoaClient: (_options: any) => {
    connect: () => Promise<boolean>;
    call: (_service: string, _method: string, _args: any[]) => Promise<{}>;
    disconnect: () => Promise<void>;
};
export declare const createSoaServer: (_options: any) => {
    register: (_name: string, _methods: Record<string, Function>) => void;
    start: () => Promise<boolean>;
    stop: () => Promise<void>;
};
