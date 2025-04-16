/**
 * Main entry point for LazyHTTP library
 *
 * This file re-exports all public APIs from the modular organization
 * of the library. It serves as the main entry point for users.
 */

// Core exports - client instance and basic types
export { http } from './client/exports/http-exports';
export {
  HttpImplementation,
  RequestOptions,
  ApiResponse,
  HttpMethod,

  // Configuration types
  AuthConfig,
  UserCredentials,
  AuthInfo,
  ProxyConfig,
  StreamConfig,
  CacheConfig,
  MetricsConfig
} from './http.types';

// HTTP method exports - basic request methods
export {
  request,
  get,
  getAll,
  getById,
  post,
  put,
  patch,
  del
} from './client/exports/http-methods';

// Authentication exports
export {
  configureAuth,
  login,
  logout,
  isAuthenticated,
  getAuthenticatedUser,
  getAccessToken
} from './client/exports/http-auth-exports';

// Configuration exports
export {
  initialize,
  configureCaching,
  invalidateCache,
  invalidateCacheByTags,
  configureMetrics,
  trackActivity,
  getCurrentMetrics
} from './client/exports/http-config-exports';

// Logger exports
export {
  httpLogger,
  LoggerConfig
} from './client/exports/http-logger-exports';

// Lazy-loaded exports
// Para cargar mediante importación dinámica:
// import('httplazy').then(module => module.loadStreamingModule()).then(({ stream }) => { ... })
export const loadStreamingModule = async () => {
  const { stream } = await import('./client/exports/http-streaming-exports');
  return { stream };
};

export const loadProxyModule = async () => {
  const { configureProxy } = await import('./client/exports/http-proxy-exports');
  return { configureProxy };
};






