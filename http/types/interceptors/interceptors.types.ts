/**
 * Tipos para interceptores de peticiones HTTP
 */

/**
 * Contexto de interceptor para modificar peticiones o respuestas
 */
export interface InterceptorContext {
  /**
   * URL de la petición
   */
  url: string;

  /**
   * Método HTTP
   */
  method: string;

  /**
   * Cabeceras HTTP
   */
  headers: Record<string, string>;

  /**
   * Cuerpo de la petición
   */
  data?: any;

  /**
   * Timestamp de inicio de la petición
   */
  timestamp: number;

  /**
   * Metadatos adicionales
   */
  meta?: Record<string, any>;
}

/**
 * Interceptor de peticiones HTTP
 */
export interface RequestInterceptor {
  /**
   * Modifica una petición antes de enviarla
   * @param context Contexto de la petición
   * @returns Contexto modificado o promesa del mismo
   */
  intercept(context: InterceptorContext): InterceptorContext | Promise<InterceptorContext>;

  /**
   * Orden de ejecución (menor número = mayor prioridad)
   */
  order?: number;

  /**
   * Identificador único para este interceptor
   */
  id?: string;
}

/**
 * Interceptor de respuestas HTTP
 */
export interface ResponseInterceptor {
  /**
   * Modifica una respuesta antes de entregarla
   * @param response Respuesta original
   * @param context Contexto de la petición original
   * @returns Respuesta modificada o promesa de la misma
   */
  intercept(response: any, context: InterceptorContext): any | Promise<any>;

  /**
   * Orden de ejecución (menor número = mayor prioridad)
   */
  order?: number;

  /**
   * Identificador único para este interceptor
   */
  id?: string;
}

/**
 * Interceptor de errores HTTP
 */
export interface ErrorInterceptor {
  /**
   * Modifica o maneja un error antes de entregarlo
   * @param error Error original
   * @param context Contexto de la petición original
   * @returns Error modificado, respuesta o promesa
   */
  intercept(error: any, context: InterceptorContext): any | Promise<any>;

  /**
   * Orden de ejecución (menor número = mayor prioridad)
   */
  order?: number;

  /**
   * Identificador único para este interceptor
   */
  id?: string;
}

/**
 * Opciones para configurar los interceptores
 */
export interface InterceptorOptions {
  /**
   * Si están habilitados globalmente
   */
  enabled?: boolean;

  /**
   * Funciones a ejecutar para cada tipo de interceptor
   */
  onRequest?: (context: InterceptorContext) => InterceptorContext | Promise<InterceptorContext>;
  onResponse?: (response: any, context: InterceptorContext) => any | Promise<any>;
  onError?: (error: any, context: InterceptorContext) => any | Promise<any>;
}
