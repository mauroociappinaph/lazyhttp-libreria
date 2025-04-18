/**
 * Main entry point for LazyHTTP library
 *
 * This file re-exports all public APIs from the modular organization
 * of the library. It serves as the main entry point for users.
 */

// Import directly from core files
import { HttpClient } from './client/core/http-client';
import {
  HttpImplementation,
  RequestOptions,
  ApiResponse,
  HttpMethod,
  AuthConfig,
  UserCredentials,
  AuthInfo,
  ProxyConfig,
  StreamConfig,
  CacheConfig,
  MetricsConfig
} from './http.types';

// Export all types directly
export {
  HttpImplementation,
  RequestOptions,
  ApiResponse,
  HttpMethod,
  AuthConfig,
  UserCredentials,
  AuthInfo,
  ProxyConfig,
  StreamConfig,
  CacheConfig,
  MetricsConfig
};

// Create HTTP client instance directly
export const http = new HttpClient() as HttpImplementation & {
  configureCaching: (config: CacheConfig) => void;
  invalidateCache: (pattern: string) => void;
  invalidateCacheByTags: (tags: string[]) => void;
  configureMetrics: (config: MetricsConfig) => void;
  trackActivity: (type: string) => void;
  getCurrentMetrics: () => any;
  _baseUrl?: string;
  _frontendUrl?: string;
  _defaultTimeout?: number;
  _defaultRetries?: number;
  _defaultHeaders?: Record<string, string>;
  _requestInterceptors: Array<(config: any) => any>;
  _responseInterceptors: Array<(response: any) => any>;
  _setupInterceptors: {
    (): void;
    (interceptor?: any, type?: 'request' | 'response'): void;
  };
  _proxyConfig?: ProxyConfig;
  _defaultStreamConfig?: StreamConfig;
};

// Bind HTTP methods directly from the http instance
export const request = http.request.bind(http);
export const get = http.get.bind(http);
export const getAll = http.getAll.bind(http);
export const getById = http.getById.bind(http);
export const post = http.post.bind(http);
export const put = http.put.bind(http);
export const patch = http.patch.bind(http);
export const del = http.delete.bind(http); // 'delete' is a reserved word in JavaScript

// Bind authentication methods directly from the http instance
export const configureAuth = http.configureAuth.bind(http);
export const login = http.login.bind(http);
export const logout = http.logout.bind(http);
export const isAuthenticated = http.isAuthenticated.bind(http);
export const getAuthenticatedUser = http.getAuthenticatedUser.bind(http);
export const getAccessToken = http.getAccessToken.bind(http);

// Bind configuration methods directly from the http instance
export const initialize = http.initialize.bind(http);
export const configureCaching = http.configureCaching.bind(http);
export const invalidateCache = http.invalidateCache.bind(http);
export const invalidateCacheByTags = http.invalidateCacheByTags.bind(http);
export const configureMetrics = http.configureMetrics.bind(http);
export const trackActivity = http.trackActivity.bind(http);
export const getCurrentMetrics = http.getCurrentMetrics.bind(http);

// Logger exports - import from http-logger.ts
import { httpLogger } from './http-logger';
export { httpLogger };

// Define LoggerConfig interface here
export interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  enableConsole?: boolean;
  enableFile?: boolean;
  logFilePath?: string;
}

// Resource symbols exports
export * from './resources';

// Re-export utilidades
export { deepFindLazy } from './utils';

// Lazy-loaded modules
export const loadStreamingModule = async () => {
  const { streamingManager } = await import('./http-streaming');
  return { stream: streamingManager.stream.bind(streamingManager) };
};

export const loadProxyModule = async () => {
  // Return configureProxy directly
  return {
    configureProxy: (config: ProxyConfig) => {
      if (http && typeof http.configureProxy === 'function') {
        return http.configureProxy(config);
      }
      throw new Error('Proxy configuration not available');
    }
  };
};

// Módulo SOA para arquitectura orientada a servicios
export const loadSoaModule = async () => {
  try {
    // Here we can't directly import the SOA module since it might not exist
    // We'll create placeholders that will be properly implemented in the build process
    return {
      createSoaClient: () => {
        console.warn('SOA module not properly loaded');
        return null;
      },
      createSoaServer: () => {
        console.warn('SOA module not properly loaded');
        return null;
      }
    };
  } catch (error) {
    console.error('Error loading SOA module:', error);
    return { createSoaClient: null, createSoaServer: null };
  }
};






