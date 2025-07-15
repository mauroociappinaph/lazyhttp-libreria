import { HttpClient } from '../core/http-client';
import { InternalHttpClient } from '../../types/internals.types';
import { ProxyConfig } from '../../types/proxy.types';
import { StreamConfig } from '../../types/stream.types';
import { CacheConfig } from '../../types/cache.types';
import { MetricsConfig } from '../../types/metrics.types';

export interface MetricsSnapshot {
  [key: string]: number | string | boolean;
}

/**
 * Crea la instancia singleton del cliente HTTP
 */
export const http = new HttpClient() as InternalHttpClient & {
  configureCaching: (config: CacheConfig) => void;
  invalidateCache: (pattern: string) => void;
  invalidateCacheByTags: (tags: string[]) => void;
  configureMetrics: (config: MetricsConfig) => void;
  trackActivity: (type: string) => void;
  getCurrentMetrics: () => MetricsSnapshot;
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
