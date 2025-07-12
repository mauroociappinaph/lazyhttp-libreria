export declare class InterceptorsManager {
    private requestInterceptors;
    private responseInterceptors;
    setupInterceptors(interceptor?: any, type?: 'request' | 'response'): void;
    private applyInterceptors;
    getRequestInterceptors(): Array<(config: any) => any>;
    getResponseInterceptors(): Array<(response: any) => any>;
}
export declare const interceptorsManager: InterceptorsManager;
