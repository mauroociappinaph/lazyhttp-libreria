import { RequestOptions, ApiResponse } from '../../http.types';

/**
 * HttpOperations - Interfaz para todas las operaciones HTTP
 * Siguiendo el principio de segregación de interfaces (ISP) para separar
 * las operaciones HTTP de otras responsabilidades.
 */
export interface HttpOperations {
  /**
   * Realiza una petición HTTP genérica
   */
  request<T>(endpoint: string, options: RequestOptions): Promise<ApiResponse<T>>;

  /**
   * Método GET para realizar peticiones HTTP GET
   * Soporta dos sintaxis:
   * - http.get(endpoint, options) - Sintaxis tradicional
   * - http.get['User'](endpoint, options) - Sintaxis con tipo específico
   *
   * Ejemplo: const users = await http.get['User']('url/getUsers');
   */
  get: {
    <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
    [resource: string]: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) => Promise<ApiResponse<T>>;
  };

  /**
   * Método getAll para obtener colecciones de recursos
   * Soporta dos sintaxis:
   * - http.getAll(endpoint, options) - Sintaxis tradicional
   * - http.getAll['User'](endpoint, options) - Sintaxis con tipo específico
   *
   * Ejemplo: const users = await http.getAll['User']('url/users');
   */
  getAll: {
    <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
    [resource: string]: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) => Promise<ApiResponse<T>>;
  };

  /**
   * Método getById para obtener un recurso por su ID
   * Soporta dos sintaxis:
   * - http.getById(endpoint, id, options) - Sintaxis tradicional
   * - http.getById['User'](endpoint, id, options) - Sintaxis con tipo específico
   *
   * Ejemplo: const user = await http.getById['User']('url/users', '123');
   */
  getById: {
    <T>(endpoint: string, id: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
    [resource: string]: <T>(endpoint: string, id: string, options?: Omit<RequestOptions, 'method' | 'body'>) => Promise<ApiResponse<T>>;
  };

  /**
   * Método POST para crear recursos
   * Soporta dos sintaxis:
   * - http.post(endpoint, body, options) - Sintaxis tradicional
   * - http.post['User'](endpoint, body, options) - Sintaxis con tipo específico
   *
   * Ejemplo: const newUser = await http.post['User']('url/users', userData);
   */
  post: {
    <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
    [resource: string]: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) => Promise<ApiResponse<T>>;
  };

  /**
   * Método PUT para actualizar recursos
   * Soporta dos sintaxis:
   * - http.put(endpoint, body, options) - Sintaxis tradicional
   * - http.put['User'](endpoint, body, options) - Sintaxis con tipo específico
   *
   * Ejemplo: const updatedUser = await http.put['User']('url/users/123', userData);
   */
  put: {
    <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
    [resource: string]: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) => Promise<ApiResponse<T>>;
  };

  /**
   * Método PATCH para actualizar parcialmente recursos
   * Soporta dos sintaxis:
   * - http.patch(endpoint, body, options) - Sintaxis tradicional
   * - http.patch['User'](endpoint, body, options) - Sintaxis con tipo específico
   *
   * Ejemplo: const patchedUser = await http.patch['User']('url/users/123', { status: 'active' });
   */
  patch: {
    <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;
    [resource: string]: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) => Promise<ApiResponse<T>>;
  };

  /**
   * Método DELETE para eliminar recursos
   * Soporta dos sintaxis:
   * - http.delete(endpoint, options) - Sintaxis tradicional
   * - http.delete['User'](endpoint, options) - Sintaxis con tipo específico
   *
   * Ejemplo: await http.delete['User']('url/users/123');
   */
  delete: {
    <T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>>;
    [resource: string]: <T>(endpoint: string, options?: Omit<RequestOptions, 'method'>) => Promise<ApiResponse<T>>;
  };

  /**
   * Método STREAM para streaming de datos
   * Soporta dos sintaxis:
   * - http.stream(endpoint, options) - Sintaxis tradicional
   * - http.stream['Video'](endpoint, options) - Sintaxis con tipo específico
   *
   * Ejemplo: const videoStream = await http.stream['Video']('url/videos/123');
   */
  stream: {
    <T = unknown>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ReadableStream<T>>;
    [resource: string]: <T = unknown>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) => Promise<ReadableStream<T>>;
  };
}
