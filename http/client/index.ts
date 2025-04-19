/**
 * Barrel file para la capa de cliente HTTP
 * Re-exporta todo desde core/index.ts para mantener compatibilidad
 */
export * from './core';

/**
 * Cliente HTTP para entornos de navegador
 *
 * Esta versión es completamente compatible con navegadores y excluye
 * todas las características que dependen de módulos específicos de Node.js.
 */

import { HttpImplementation, RequestOptions, ProxyConfig, StreamConfig } from '../common/types';

// Importar cliente (implementación separada)
// Aquí usaríamos la implementación real en el código completo
class BrowserHttpClient implements HttpImplementation {
  // Implementación básica para demostración
  // En la implementación real, esto importaría axios o fetch
  async request<_T>(_method: any, _url: string, _data?: any, _options?: RequestOptions): Promise<any> {
    return { data: {}, status: 200, headers: {} };
  }

  // Métodos HTTP básicos
  async get<T>(url: string, options?: RequestOptions) {
    return this.request<T>('GET', url, null, options);
  }

  async getAll<T>(url: string, options?: RequestOptions) {
    return this.request<T[]>('GET', url, null, options);
  }

  async getById<T>(url: string, id: string | number, options?: RequestOptions) {
    return this.request<T>('GET', `${url}/${id}`, null, options);
  }

  async post<T>(url: string, data?: any, options?: RequestOptions) {
    return this.request<T>('POST', url, data, options);
  }

  async put<T>(url: string, data?: any, options?: RequestOptions) {
    return this.request<T>('PUT', url, data, options);
  }

  async patch<T>(url: string, data?: any, options?: RequestOptions) {
    return this.request<T>('PATCH', url, data, options);
  }

  async delete<T>(url: string, options?: RequestOptions) {
    return this.request<T>('DELETE', url, null, options);
  }

  // Métodos de autenticación
  configureAuth(_config: any) {}
  async login(_credentials: any) { return { user: null, token: '' }; }
  async logout() {}
  isAuthenticated() { return false; }
  getAuthenticatedUser() { return null; }
  getAccessToken() { return null; }

  // Métodos de configuración
  initialize(_config: any) {}
  configureCaching(_config: any) {}
  invalidateCache(_pattern: string) {}
  invalidateCacheByTags(_tags: string[]) {}
  configureMetrics(_config: any) {}
  trackActivity(_type: string) {}
  getCurrentMetrics() { return {}; }

  // Métodos básicos de streaming para navegador
  streamBasic(url: string, config?: StreamConfig) {
    // Implementación básica con fetch
    return fetch(url).then(response => {
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Streaming not supported');

      return new ReadableStream({
        start(controller) {
              function pump(): Promise<any> {
            return reader!.read().then(({ done, value }: { done: boolean, value?: any }) => {
              if (done) {
                controller.close();
                if (config?.onComplete) config.onComplete();
                return;
              }

              if (config?.onData) config.onData(value);
              controller.enqueue(value);
              return pump();
            }).catch(err => {
              if (config?.onError) config.onError(err);
              controller.error(err);
            });
          }
          return pump();
        }
      });
    });
  }
}

// Crear instancia de cliente HTTP
export const http = new BrowserHttpClient();

// Exportar métodos individuales para facilitar su uso
export const request = http.request.bind(http);
export const get = http.get.bind(http);
export const getAll = http.getAll.bind(http);
export const getById = http.getById.bind(http);
export const post = http.post.bind(http);
export const put = http.put.bind(http);
export const patch = http.patch.bind(http);
export const del = http.delete.bind(http);  // 'delete' es palabra reservada

// Métodos de autenticación
export const configureAuth = http.configureAuth.bind(http);
export const login = http.login.bind(http);
export const logout = http.logout.bind(http);
export const isAuthenticated = http.isAuthenticated.bind(http);
export const getAuthenticatedUser = http.getAuthenticatedUser.bind(http);
export const getAccessToken = http.getAccessToken.bind(http);

// Métodos de configuración
export const initialize = http.initialize.bind(http);
export const configureCaching = http.configureCaching.bind(http);
export const invalidateCache = http.invalidateCache.bind(http);
export const invalidateCacheByTags = http.invalidateCacheByTags.bind(http);
export const configureMetrics = http.configureMetrics.bind(http);
export const trackActivity = http.trackActivity.bind(http);
export const getCurrentMetrics = http.getCurrentMetrics.bind(http);

// Método básico de streaming para navegadores
export const stream = http.streamBasic.bind(http);

// Versión stub de funciones de servidor para mantener compatibilidad de API
export const configureProxy = (_config: ProxyConfig) => {
  console.warn('Proxy configuration is not supported in browser environments');
  return false;
};

// Re-exportar tipos
export * from '../common/types';
