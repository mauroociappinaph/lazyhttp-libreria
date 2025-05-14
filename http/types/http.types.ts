/**
 * Opciones para las peticiones HTTP
 */
export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  retries?: number;
  cache?: boolean | number;
  tags?: string[];
  withAuth?: boolean;
  retryOptions?: any;
  /**
   * Función o array de funciones para transformar los datos antes de enviarlos (request)
   * Similar a transformRequest de Axios
   */
  transformRequest?: ((data: any) => any) | Array<(data: any) => any>;
  /**
   * Función o array de funciones para transformar los datos de respuesta antes de entregarlos
   * Similar a transformResponse de Axios
   */
  transformResponse?: ((data: any) => any) | Array<(data: any) => any>;
}
