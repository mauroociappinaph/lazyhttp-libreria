/**
 * Barrel file para la capa de cliente HTTP
 * Re-exporta todo desde core/index.ts para mantener compatibilidad
 */


/**
 * Cliente HTTP para entornos de navegador
 *
 * Esta versión es completamente compatible con navegadores y excluye
 * todas las características que dependen de módulos específicos de Node.js.
 */import { HttpClient } from './core/http-client';

const http = new HttpClient();
export { http };
export const request = http.request.bind(http);
export const get = http.get.bind(http);
export const getAll = http.getAll.bind(http);
export const getById = http.getById.bind(http);
export const post = http.post.bind(http);
export const put = http.put.bind(http);
export const patch = http.patch.bind(http);
export const del = http.delete.bind(http);

export const configureAuth = http.configureAuth.bind(http);
export const login = http.login.bind(http);
export const logout = http.logout.bind(http);
export const isAuthenticated = http.isAuthenticated.bind(http);
export const getAuthenticatedUser = http.getAuthenticatedUser.bind(http);
export const getAccessToken = http.getAccessToken.bind(http);

export const initialize = http.initialize.bind(http);
export const configureCaching = http.configureCaching.bind(http);
export const invalidateCache = http.invalidateCache.bind(http);
export const invalidateCacheByTags = http.invalidateCacheByTags.bind(http);
export const configureMetrics = http.configureMetrics.bind(http);
export const trackActivity = http.trackActivity.bind(http);
export const getCurrentMetrics = http.getCurrentMetrics.bind(http);

// Versión stub de funciones de servidor para mantener compatibilidad de API
export const configureProxy = (_config: any) => {
  console.warn('Proxy configuration is not supported in browser environments');
  return false;
};

// Re-exportar tipos
export * from '../common/types';
