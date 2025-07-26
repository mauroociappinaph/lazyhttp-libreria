/**
 * Servicio de caché centralizado
 * Elimina la duplicación de métodos de caché entre BrowserHttpClient y HttpClient
 */

export interface ICacheService {
  invalidateCache(pattern: string): void;
  invalidateCacheByTags(tags: string[]): void;
  configureCaching(config?: any): void;
}

/**
 * Implementación del servicio de caché
 * Centraliza toda la lógica de caché para evitar duplicación
 */
export class CacheService implements ICacheService {
  private cacheManager: any; // Será inyectado según el contexto

  constructor(cacheManager: any) {
    this.cacheManager = cacheManager;
  }

  /**
   * Invalida caché por patrón
   */
  invalidateCache(pattern: string): void {
    if (this.cacheManager && this.cacheManager.invalidate) {
      this.cacheManager.invalidate(pattern);
    }
  }

  /**
   * Invalida caché por tags
   */
  invalidateCacheByTags(tags: string[]): void {
    if (this.cacheManager && this.cacheManager.invalidateByTags) {
      this.cacheManager.invalidateByTags(tags);
    }
  }

  /**
   * Configura el sistema de caché
   */
  configureCaching(config?: any): void {
    if (this.cacheManager && this.cacheManager.configure) {
      this.cacheManager.configure(config);
    }
  }
}
