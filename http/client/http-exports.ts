import { HttpClient } from './http-client';
import {
  HttpImplementation,
  ProxyConfig,
  StreamConfig,
  AuthConfig,
  UserCredentials,
  CacheConfig,
  MetricsConfig
} from '../http.types';
import { ReadableStream } from 'stream/web';

/**
 * Crea la instancia singleton del cliente HTTP
 */
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
