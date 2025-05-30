import {
  CacheConfig,
  MetricsConfig,
  ProxyConfig,
  StreamConfig
} from '../../http.types';
import { httpConfiguration } from '../../http-configuration';
import { HttpPropertyManager } from './http-property-manager';

/**
 * ConfigManager - Responsable de manejar todas las operaciones de configuración
 * Aplicando el principio de responsabilidad única (SRP) para separar la configuración
 * de las operaciones HTTP generales.
 */
export class HttpConfigManager {
  constructor(private propertyManager: HttpPropertyManager) {}

  /**
   * Inicializa la configuración del cliente HTTP
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
    // Inicializar la configuración global
    await httpConfiguration.initialize(config);

    // Actualizar las propiedades del cliente
    this.propertyManager.updateFromConfig({
      baseUrl: config?.baseUrl,
      timeout: config?.timeout,
      retries: config?.retries,
      headers: config?.headers
    });

    return Promise.resolve();
  }

  /**
   * Configura el sistema de caché
   */
  configureCaching(config: CacheConfig): void {
    httpConfiguration.configureCaching(config);
  }

  /**
   * Invalida entradas de caché que coinciden con el patrón
   */
  invalidateCache(pattern: string): void {
    httpConfiguration.invalidateCache(pattern);
  }

  /**
   * Invalida entradas de caché por etiquetas
   */
  invalidateCacheByTags(tags: string[]): void {
    httpConfiguration.invalidateCacheByTags(tags);
  }

  /**
   * Configura el sistema de métricas
   */
  configureMetrics(config: MetricsConfig): void {
    httpConfiguration.configureMetrics(config);
  }

  /**
   * Registra actividad para métricas
   */
  trackActivity(type: string): void {
    httpConfiguration.trackActivity(type);
  }

  /**
   * Obtiene las métricas actuales
   */
  getCurrentMetrics(): any {
    return httpConfiguration.getCurrentMetrics();
  }

  /**
   * Configura el proxy
   */
  configureProxy(config: ProxyConfig): void {
    httpConfiguration.configureProxy(config);
  }
}
