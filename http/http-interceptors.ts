import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { HttpAuthError } from './http-errors';
import { httpInstance, AUTH_ENDPOINTS, AUTH_STORAGE } from './http-config';

// Estado para manejar el refresh token
let isRefreshing = false;
let failedRequests: Array<() => void> = [];

/**
 * Configura los interceptores para la instancia de Axios
 * @param instance Instancia de Axios a configurar
 */
export function setupInterceptors(instance: AxiosInstance = httpInstance): void {
  // Interceptor de solicitud
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // No añadir token a peticiones de refresh
      if (config.url?.includes(AUTH_ENDPOINTS.REFRESH_TOKEN)) {
        return config;
      }

      const token = localStorage.getItem(AUTH_STORAGE.TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptor de respuesta
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config;

      // Solo intentar refresh si:
      // 1. Es un error 401 (Unauthorized)
      // 2. Hay un request original
      // 3. No es una petición de refresh token (evitar bucles)
      if (
        error.response?.status === 401 &&
        originalRequest &&
        originalRequest.url &&
        !originalRequest.url.includes(AUTH_ENDPOINTS.REFRESH_TOKEN)
      ) {
        if (!isRefreshing) {
          isRefreshing = true;

          try {
            // Intentar obtener un nuevo token
            const newToken = await refreshToken();

            // Si se obtuvo un nuevo token, actualizar token y reintentar peticiones
            if (newToken) {
              // Almacenar nuevo token
              localStorage.setItem(AUTH_STORAGE.TOKEN_KEY, newToken);

              // Ejecutar todas las peticiones fallidas en cola
              failedRequests.forEach((callback) => callback());
              failedRequests = [];

              // Reintentar la petición original con el nuevo token
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              return axios(originalRequest);
            }
          } catch {
            // Si falla el refresh, limpiar autenticación
            handleRefreshTokenFailure();
          } finally {
            isRefreshing = false;
          }
        }

        // Si ya está refrescando, añadir a la cola de peticiones pendientes
        return new Promise((resolve) => {
          failedRequests.push(() => {
            if (originalRequest.headers) {
              const token = localStorage.getItem(AUTH_STORAGE.TOKEN_KEY);
              if (token) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
            }
            resolve(axios(originalRequest));
          });
        });
      }

      // Si no es un error 401 o no se pudo manejar, rechazar normalmente
      return Promise.reject(error);
    }
  );
}

/**
 * Obtiene un nuevo token usando el refresh token
 * @returns Nuevo token de acceso
 */
export async function refreshToken(): Promise<string> {
  const refreshToken = localStorage.getItem(AUTH_STORAGE.REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    throw new HttpAuthError('No refresh token available');
  }

  const response = await axios.post<{ token: string }>(
    `${AUTH_ENDPOINTS.REFRESH_TOKEN}`,
    { refreshToken },
    { baseURL: httpInstance.defaults.baseURL }
  );

  if (!response.data?.token) {
    throw new HttpAuthError('Invalid token response');
  }

  return response.data.token;
}

/**
 * Maneja el fallo al refrescar el token
 */
export function handleRefreshTokenFailure(): void {
  // Limpiar tokens
  localStorage.removeItem(AUTH_STORAGE.TOKEN_KEY);
  localStorage.removeItem(AUTH_STORAGE.REFRESH_TOKEN_KEY);

  // Redirigir a login
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

// Exportar todo junto
export const authInterceptors = {
  setupInterceptors,
  refreshToken,
  handleRefreshTokenFailure
};
