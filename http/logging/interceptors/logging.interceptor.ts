import {
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
  InterceptorContext,
} from "../../types/interceptors/interceptors.types";
import { logger } from "../logger";

export class LoggingInterceptor
  implements RequestInterceptor, ResponseInterceptor, ErrorInterceptor
{
  id = "LoggingInterceptor";
  order = 100;

  intercept(
    context: InterceptorContext
  ): InterceptorContext | Promise<InterceptorContext> {
    logger.info("HTTP Request", {
      url: context.url,
      method: context.method,
      headers: context.headers,
      data: context.data,
      timestamp: context.timestamp,
    });
    return context;
  }

  interceptResponse(
    response: any,
    context: InterceptorContext
  ): any | Promise<any> {
    logger.info("HTTP Response", {
      url: context.url,
      method: context.method,
      status: response?.status,
      data: response?.data,
      headers: response?.headers,
      timestamp: Date.now(),
    });
    return response;
  }

  interceptError(error: any, context: InterceptorContext): any | Promise<any> {
    logger.error("HTTP Error", {
      url: context.url,
      method: context.method,
      error,
      timestamp: Date.now(),
    });
    return Promise.reject(error);
  }
}
