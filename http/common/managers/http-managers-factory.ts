import { CacheConfig, StreamConfig, MetricsConfig } from '../types';

/**
 * Factoría para crear gestores HTTP compartidos entre cliente y servidor
 *
 * Permite crear instancias de managers con una configuración común,
 * facilitando la reutilización de lógica entre entornos.
 */
export class HttpManagersFactory {
  /**
   * Crea un gestor de caché con la configuración proporcionada
   * @param config Configuración de caché
   * @returns Gestor de caché configurado
   */
  static createCacheManager(config: CacheConfig) {
    // Implementación básica común
    return {
      enabled: config.enabled,
      ttl: config.ttl || 300000,
      maxSize: config.maxSize || 100,
      storage: config.storage || 'memory',

      /**
       * Genera una clave de caché basada en método, URL y datos
       */
      generateCacheKey(method: string, url: string, data?: any): string {
        const normalizedMethod = method.toUpperCase();

        if (!data || ['GET', 'HEAD', 'OPTIONS'].includes(normalizedMethod)) {
          return `${normalizedMethod}:${url}`;
        }

        // Para métodos con cuerpo, incluir un hash del cuerpo
        const dataString = typeof data === 'string' ? data : JSON.stringify(data);
        const dataHash = this.hashString(dataString);

        return `${normalizedMethod}:${url}:${dataHash}`;
      },

      /**
       * Genera un hash simple para una cadena
       */
      hashString(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convertir a 32 bits
        }
        return Math.abs(hash).toString(16);
      },

      // Las implementaciones específicas deberán implementar estos métodos
      get: (_key: string): any => { throw new Error('Método no implementado'); },
      set: (_key: string, _value: any, _ttl?: number): void => { throw new Error('Método no implementado'); },
      has: (_key: string): boolean => { throw new Error('Método no implementado'); },
      delete: (_key: string): boolean => { throw new Error('Método no implementado'); },
      clear: (): void => { throw new Error('Método no implementado'); },
      invalidateByPattern: (_pattern: string): void => { throw new Error('Método no implementado'); },
      invalidateByTags: (_tags: string[]): void => { throw new Error('Método no implementado'); }
    };
  }

  /**
   * Crea un gestor de interceptores con configuración común
   * @returns Gestor de interceptores configurado
   */
  static createInterceptorsManager() {
    // Listas comunes de interceptores
    const requestInterceptors: Array<(config: any) => any> = [];
    const responseInterceptors: Array<(response: any) => any> = [];

    return {
      /**
       * Añade un interceptor de petición o respuesta
       */
      setupInterceptors(interceptor?: any, type?: 'request' | 'response'): void {
        if (!interceptor) return;

        if (type === 'request' || !type) {
          requestInterceptors.push(interceptor);
        }

        if (type === 'response' || !type) {
          responseInterceptors.push(interceptor);
        }
      },

      /**
       * Obtiene los interceptores de petición
       */
      getRequestInterceptors(): Array<(config: any) => any> {
        return [...requestInterceptors];
      },

      /**
       * Obtiene los interceptores de respuesta
       */
      getResponseInterceptors(): Array<(response: any) => any> {
        return [...responseInterceptors];
      },

      /**
       * Aplica los interceptores de petición a una configuración
       */
      applyRequestInterceptors(config: any): any {
        return requestInterceptors.reduce((acc, interceptor) => interceptor(acc), config);
      },

      /**
       * Aplica los interceptores de respuesta a una respuesta
       */
      applyResponseInterceptors(response: any): any {
        return responseInterceptors.reduce((acc, interceptor) => interceptor(acc), response);
      }
    };
  }

  /**
   * Crea un gestor de métricas con la configuración proporcionada
   * @param config Configuración de métricas
   * @returns Gestor de métricas configurado
   */
  static createMetricsManager(config: MetricsConfig) {
    // Datos base para métricas
    const metrics = {
      requests: 0,
      errors: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      totalResponseTime: 0
    };

    return {
      enabled: config.enabled,
      trackErrors: config.trackErrors || true,
      trackPerformance: config.trackPerformance || true,
      trackCache: config.trackCache || true,

      /**
       * Registra una nueva petición
       */
      trackRequest(_url: string): void {
        if (!config.enabled) return;
        metrics.requests++;
      },

      /**
       * Registra un error
       */
      trackError(_error: any): void {
        if (!config.enabled || !config.trackErrors) return;
        metrics.errors++;
      },

      /**
       * Registra el tiempo de respuesta
       */
      trackResponseTime(time: number): void {
        if (!config.enabled || !config.trackPerformance) return;

        metrics.totalResponseTime += time;
        metrics.averageResponseTime = metrics.totalResponseTime / metrics.requests;
      },

      /**
       * Registra un acierto de caché
       */
      trackCacheHit(): void {
        if (!config.enabled || !config.trackCache) return;
        metrics.cacheHits++;
      },

      /**
       * Registra un fallo de caché
       */
      trackCacheMiss(): void {
        if (!config.enabled || !config.trackCache) return;
        metrics.cacheMisses++;
      },

      /**
       * Obtiene las métricas actuales
       */
      getMetrics(): any {
        return { ...metrics };
      },

      /**
       * Registra actividad personalizada
       */
      trackActivity(_type: string): void {
        if (!config.enabled) return;
        // Extensible para registrar métricas personalizadas
      }
    };
  }

  /**
   * Crea un gestor de streaming con la configuración proporcionada
   * @param _config Configuración de streaming
   * @returns Gestor de streaming configurado
   */
  static createStreamingManager(_config?: StreamConfig) {
    return {
      /**
       * Método base para streaming, las implementaciones específicas lo sobrescribirán
       */
      async stream<T>(_url: string, _options: any): Promise<ReadableStream<T>> {
        throw new Error('Método stream() debe ser implementado por la clase derivada');
      }
    };
  }
}
