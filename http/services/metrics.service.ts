/**
 * Servicio de métricas centralizado
 * Elimina la duplicación de métodos de métricas entre BrowserHttpClient y HttpClient
 */

export interface IMetricsService {
  trackActivity(type: string, data?: any): void;
  getCurrentMetrics(): MetricsData;
  configureMetrics(config?: any): void;
}

export interface MetricsData {
  requests: number;
  errors: number;
  cacheHits: number;
  cacheMisses: number;
  [key: string]: any;
}

/**
 * Implementación del servicio de métricas
 * Centraliza toda la lógica de métricas para evitar duplicación
 */
export class MetricsService implements IMetricsService {
  private metricsConfig: any;
  private metricsManager?: any; // Opcional, según el contexto

  constructor(metricsConfig: any, metricsManager?: any) {
    this.metricsConfig = metricsConfig;
    this.metricsManager = metricsManager;
  }

  /**
   * Registra actividad para métricas
   */
  trackActivity(type: string, data?: any): void {
    if (!this.metricsConfig?.enabled) return;

    try {
      const metricsKey = 'http_metrics';
      const currentMetrics = this.getCurrentMetrics();

      // Actualizar métricas según el tipo
      switch (type) {
        case 'request':
          currentMetrics.requests++;
          break;
        case 'error':
          currentMetrics.errors++;
          break;
        case 'cache_hit':
          currentMetrics.cacheHits++;
          break;
        case 'cache_miss':
          currentMetrics.cacheMisses++;
          break;
        default:
          // Métricas personalizadas
          if (data) {
            currentMetrics[type] = (currentMetrics[type] || 0) + 1;
          }
      }

      // Guardar métricas actualizadas
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(metricsKey, JSON.stringify(currentMetrics));
      }

      // Si hay un manager de métricas, notificarle
      if (this.metricsManager && this.metricsManager.track) {
        this.metricsManager.track(type, data);
      }
    } catch (error) {
      console.warn('Error tracking activity:', error);
    }
  }

  /**
   * Obtiene las métricas actuales
   */
  getCurrentMetrics(): MetricsData {
    try {
      const metricsKey = 'http_metrics';

      // Intentar obtener de localStorage primero
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(metricsKey);
        if (stored) {
          return JSON.parse(stored);
        }
      }

      // Si hay un manager de métricas, usarlo
      if (this.metricsManager && this.metricsManager.getCurrentMetrics) {
        return this.metricsManager.getCurrentMetrics();
      }

      // Métricas por defecto
      return {
        requests: 0,
        errors: 0,
        cacheHits: 0,
        cacheMisses: 0
      };
    } catch (error) {
      console.warn('Error getting current metrics:', error);
      return {
        requests: 0,
        errors: 0,
        cacheHits: 0,
        cacheMisses: 0
      };
    }
  }

  /**
   * Configura el sistema de métricas
   */
  configureMetrics(config?: any): void {
    if (config) {
      this.metricsConfig = { ...this.metricsConfig, ...config };
    }

    if (this.metricsManager && this.metricsManager.configure) {
      this.metricsManager.configure(this.metricsConfig);
    }
  }

  /**
   * Resetea las métricas
   */
  resetMetrics(): void {
    const defaultMetrics: MetricsData = {
      requests: 0,
      errors: 0,
      cacheHits: 0,
      cacheMisses: 0
    };

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('http_metrics', JSON.stringify(defaultMetrics));
    }

    if (this.metricsManager && this.metricsManager.reset) {
      this.metricsManager.reset();
    }
  }
}
