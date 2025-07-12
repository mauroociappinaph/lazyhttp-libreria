
import { ICacheManager } from '../../common/interfaces/cache.manager.interface';

export class CacheManager implements ICacheManager {
  private tokenStorage: 'localStorage' | 'sessionStorage' | 'memory' = 'localStorage';

  constructor(private cacheConfig: any) {}

  invalidateCache(pattern: string): void {
    if (!this.cacheConfig.enabled) return;

    try {
      const storage = this._getStorage();
      const keys = Object.keys(storage);

      const matchingKeys = keys.filter(key =>
        key.startsWith('http_cache_') &&
        key.includes(pattern)
      );

      matchingKeys.forEach(key => storage.removeItem(key));
    } catch (error) {
      console.error('Error al invalidar caché:', error);
    }
  }

  invalidateCacheByTags(tags: string[]): void {
    if (!this.cacheConfig.enabled || !tags.length) return;

    try {
      const storage = this._getStorage();
      const keys = Object.keys(storage);

      const cacheKeys = keys.filter(key => key.startsWith('http_cache_'));

      cacheKeys.forEach(key => {
        try {
          const cacheData = JSON.parse(storage.getItem(key) || '{}');

          if (cacheData.tags && Array.isArray(cacheData.tags)) {
            const hasMatchingTag = tags.some(tag => cacheData.tags.includes(tag));
            if (hasMatchingTag) {
              storage.removeItem(key);
            }
          }
        } catch {
          // Ignorar entradas inválidas
        }
      });
    } catch (error) {
      console.error('Error al invalidar caché por tags:', error);
    }
  }

  private _getStorage(): Storage {
    if (this.tokenStorage === 'sessionStorage') {
      return sessionStorage;
    }
    return localStorage;
  }
}
