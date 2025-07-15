import { CacheConfig } from './types/cache.types';
import { MetricsConfig } from './types/metrics.types';
import { ProxyConfig } from './types/proxy.types';
import { StreamConfig } from './types/stream.types';
import { initialize as initializeHelper } from './http-helpers';
import { httpCacheManager } from './client/managers/http-cache-manager';
import { metricsManager } from './metrics/http-metrics-index';
import { streamingManager } from './http-streaming';

/**
 * Clase para manejar la configuración centralizada del cliente HTTP
 */
export class HttpConfiguration {
  // Configuración básica
  baseUrl?: string;
  frontendUrl?: string;
  defaultTimeout: number = 10000;
  defaultRetries: number = 0;
  defaultHeaders: Record<string, string> = {};

  // Configuraciones específicas
  proxyConfig?: ProxyConfig;
  streamConfig?: StreamConfig;

  /**
   * Inicializa el cliente HTTP con la configuración proporcionada
   */
  async initialize(config?: {
    baseUrl?: string,
    frontendUrl?: string,
    suggestionService?: { enabled: boolean, url: string },
    cache?: CacheConfig,
    metrics?: MetricsConfig,
    timeout?: number,
    retries?: number,
    headers?: Record<string, string>,
    proxy?: ProxyConfig,
    stream?: StreamConfig
  }): Promise<void> {
    // Configuración básica
    if (config?.baseUrl) {
      this.baseUrl = config.baseUrl;
    }

    if (config?.frontendUrl) {
      this.frontendUrl = config.frontendUrl;
    }

    if (config?.timeout !== undefined) {
      this.defaultTimeout = config.timeout;
    }

    if (config?.retries !== undefined) {
      this.defaultRetries = config.retries;
    }

    if (config?.headers) {
      this.defaultHeaders = { ...this.defaultHeaders, ...config.headers };
    }

    // Configuraciones específicas
    if (config?.proxy) {
      this.proxyConfig = config.proxy;
      this.configureProxy(config.proxy);
    }

    if (config?.stream) {
      this.streamConfig = config.stream;
      this.configureStream(config.stream);
    }

    // Inicializar caché si está configurado
    if (config?.cache) {
      this.configureCaching(config.cache);
    }

    // Inicializar métricas si está configurado
    if (config?.metrics) {
      this.configureMetrics(config.metrics);
    }

    return initializeHelper();
  }

  /**
   * Configura el caché
   */
  configureCaching(config: CacheConfig): void {
    httpCacheManager.configure(config);
  }

  /**
   * Invalida las entradas de caché que coincidan con el patrón
   */
  invalidateCache(pattern: string): void {
    httpCacheManager.invalidate(pattern);
  }

  /**
   * Invalida las entradas de caché que tengan las etiquetas especificadas
   */
  invalidateCacheByTags(tags: string[]): void {
    httpCacheManager.invalidateByTags(tags);
  }

  /**
   * Configura las métricas
   */
  configureMetrics(config: MetricsConfig): void {
    metricsManager.configure(config);
  }

  /**
   * Registra un tipo de actividad para métricas
   */
  trackActivity(type: string): void {
    metricsManager.trackActivity(type);
  }

  /**
   * Obtiene las métricas actuales
   */
  getCurrentMetrics(): any {
    return metricsManager.getCurrentMetrics();
  }

  /**
   * Configura el proxy
   */
  configureProxy(config: ProxyConfig): void {
    this.proxyConfig = config;

    // Configurar también en el streaming manager
    streamingManager.configure({
      proxyConfig: config
    });
  }

  /**
   * Configura el streaming
   */
  configureStream(config: StreamConfig): void {
    this.streamConfig = config;

    // Configurar también en el streaming manager
    streamingManager.configure({
      streamConfig: config
    });
  }
}

// Exportar una instancia única
export const httpConfiguration = new HttpConfiguration();
