/**
 * Cliente HTTP - Interfaz pública
 * Expone únicamente los métodos que deben ser accesibles para los consumidores
 */
export interface HttpClient {
  /**
   * Realiza una petición HTTP genérica
   */
  request<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>>;

  /**
   * Realiza una petición GET
   */
  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;

  /**
   * Realiza una petición GET para obtener todos los elementos de una colección
   */
  getAll<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;

  /**
   * Realiza una petición GET para obtener un elemento por su ID
   */
  getById<T>(endpoint: string, id: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;

  /**
   * Realiza una petición POST
   */
  post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;

  /**
   * Realiza una petición PUT
   */
  put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;

  /**
   * Realiza una petición PATCH
   */
  patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>>;

  /**
   * Realiza una petición DELETE
   */
  delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>>;

  /**
   * Inicializa el cliente HTTP
   * @param config Configuración opcional
   */
  initialize(config?: Partial<InitConfig>): Promise<void>;

  /**
   * Configura el sistema de autenticación
   * @param config Configuración de autenticación
   */
  configureAuth(config: AuthConfig): void;

  /**
   * Inicia sesión con las credenciales proporcionadas
   * @param credentials Credenciales del usuario
   * @returns Información de autenticación
   */
  login(credentials: UserCredentials): Promise<AuthInfo>;

  /**
   * Cierra la sesión actual
   */
  logout(): Promise<void>;

  /**
   * Verifica si el usuario está autenticado
   * @returns `true` si está autenticado, `false` en caso contrario
   */
  isAuthenticated(): boolean;

  /**
   * Obtiene la información del usuario autenticado
   * @returns Información del usuario o `null` si no está autenticado
   */
  getAuthenticatedUser(): Promise<any | null>;

  /**
   * Obtiene el token de acceso actual
   * @returns Token de acceso o `null` si no está autenticado
   */
  getAccessToken(): string | null;

  /**
   * Configura el sistema de caché
   * @param config Configuración de caché
   */
  configureCaching(config: CacheConfig): void;

  /**
   * Invalida entradas de caché que coincidan con un patrón
   * @param pattern Patrón para invalidar (se puede usar * como comodín)
   */
  invalidateCache(pattern: string): void;

  /**
   * Invalida entradas de caché con ciertos tags
   * @param tags Tags para invalidar
   */
  invalidateCacheByTags(tags: string[]): void;
}

// Exporta los tipos utilizados en esta interfaz
import { RequestOptions, ApiResponse, InitConfig } from '../types/core.types';
import { AuthConfig, UserCredentials, AuthInfo } from '../types/auth.types';
import { CacheConfig } from '../types/cache.types';
