import { RequestInterceptor, ResponseInterceptor, ErrorInterceptor, InterceptorContext } from '../../types/interceptors/interceptors.types';
export declare class LoggingInterceptor implements RequestInterceptor, ResponseInterceptor, ErrorInterceptor {
    id: string;
    order: number;
    intercept(context: InterceptorContext): InterceptorContext | Promise<InterceptorContext>;
    interceptResponse(response: any, context: InterceptorContext): any | Promise<any>;
    interceptError(error: any, context: InterceptorContext): any | Promise<any>;
}
