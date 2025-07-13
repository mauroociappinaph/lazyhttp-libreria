export interface InterceptorContext {
    url: string;
    method: string;
    headers: Record<string, string>;
    data?: any;
    timestamp: number;
    meta?: Record<string, any>;
}
export interface RequestInterceptor {
    intercept(context: InterceptorContext): InterceptorContext | Promise<InterceptorContext>;
    order?: number;
    id?: string;
}
export interface ResponseInterceptor {
    intercept(response: any, context: InterceptorContext): any | Promise<any>;
    order?: number;
    id?: string;
}
export interface ErrorInterceptor {
    intercept(error: any, context: InterceptorContext): any | Promise<any>;
    order?: number;
    id?: string;
}
export interface InterceptorOptions {
    enabled?: boolean;
    onRequest?: (context: InterceptorContext) => InterceptorContext | Promise<InterceptorContext>;
    onResponse?: (response: any, context: InterceptorContext) => any | Promise<any>;
    onError?: (error: any, context: InterceptorContext) => any | Promise<any>;
}
