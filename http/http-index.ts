/**
 * Main entry point for LazyHTTP library
 *
 * This file re-exports all public APIs from the modular organization
 * of the library. It serves as the main entry point for users.
 */

// Core exports - client instance and basic types
export { http } from './client/http-exports';
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
  del,
  stream
} from './client/http-methods';

// Authentication exports
export {
  configureAuth,
  login,
  logout,
  isAuthenticated,
  getAuthenticatedUser,
  getAccessToken
} from './client/http-auth-exports';

// Configuration exports
export {
  initialize,
  configureCaching,
  invalidateCache,
  invalidateCacheByTags,
  configureMetrics,
  trackActivity,
  getCurrentMetrics
} from './client/http-config-exports';

// Logger exports
export {
  httpLogger,
  LoggerConfig
} from './client/http-logger-exports';






