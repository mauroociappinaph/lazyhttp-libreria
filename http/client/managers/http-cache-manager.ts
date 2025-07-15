import { CacheConfig, CacheOptions, CacheEntry, CacheStrategy, CacheStorageType } from '../../types/cache.types';
import { RequestOptions, ApiResponse, HttpMethod } from '../../types/core.types';

/**
 * HttpCacheManager - Responsable de manejar todas las operaciones de caché.
 * Encapsula la lógica de configuración, almacenamiento, recuperación e invalidación de caché.
 */
export class HttpCacheManager {
  // Estado interno del caché
  private cacheState = {
    config: {
      enabled: false,
      defaultStrategy: 'cache-first' as CacheStrategy,
      defaultTTL: 5 * 60 * 1000, // 5 minutos
      storage: 'memory' as CacheStorageType,
      maxSize: 100
    },
    cache: new Map<string, CacheEntry<unknown>>()
  };

  /**
   * Configura el sistema de caché
   */
  public configure(config: Partial<CacheConfig>): void {
    this.cacheState.config = { ...this.cacheState.config, ...config };

    // Si se deshabilita la caché, limpiarla
    if (!this.cacheState.config.enabled) {
      this.clear();
    }
  }

  /**
   * Verifica si la caché está habilitada
   */
  public isEnabled(): boolean {
    return this.cacheState.config.enabled;
  }

  /**
   * Genera una clave de caché a partir de un endpoint y opciones
   */
  public generateCacheKey(endpoint: string, options?: RequestOptions): string {
    if (options?.cache?.key) {
      return options.cache.key;
    }

    // Normalizar el endpoint
    let normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // Incluir parámetros en la clave si existen
    if (options?.params) {
      const params = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      normalizedEndpoint += `?${params.toString()}`;
    }

    // Incluir método en la clave (por defecto es GET)
    const method = options?.method || 'GET';

    // Incluir tags en la clave si existen
    let tagsString = '';
    if (options?.cache?.tags && options.cache.tags.length > 0) {
      tagsString = `:tags=${options.cache.tags.sort().join(',')}`;
    }

    return `${method}:${normalizedEndpoint}${tagsString}`;
  }

  /**
   * Obtiene la instancia de almacenamiento según la configuración
   */
  private _getStorage(): Map<string, CacheEntry<unknown>> | Storage {
    if (this.cacheState.config.storage === 'localStorage') {
      return localStorage;
    } else if (this.cacheState.config.storage === 'sessionStorage') {
      return sessionStorage;
    } else {
      return this.cacheState.cache;
    }
  }

  /**
   * Obtiene una entrada de la caché
   */
  public get<T>(key: string): ApiResponse<T> | undefined {
    const storage = this._getStorage();
    let entry: CacheEntry<T> | undefined;

    if (storage instanceof Map) {
      entry = storage.get(key) as CacheEntry<T>;
    } else {
      const stored = storage.getItem(key);
      if (stored) {
        try {
          entry = JSON.parse(stored);
        } catch (e) {
          console.error("Error parsing cache entry from storage", e);
          storage.removeItem(key);
          return undefined;
        }
      }
    }

    if (!entry) {
      return undefined;
    }

    // Verificar si ha expirado
    if (Date.now() > entry.expiresAt) {
      this.remove(key);
      return undefined;
    }

    // Actualizar timestamp de último acceso (solo para Map, para Storage se actualiza al setear)
    if (storage instanceof Map) {
      entry.lastAccessed = Date.now();
      storage.set(key, entry);
    }

    return entry.value as ApiResponse<T>;
  }

  /**
   * Almacena un valor en la caché
   */
  public set<T>(key: string, value: ApiResponse<T>, options?: CacheOptions): void {
    if (!this.cacheState.config.enabled) {
      return;
    }

    const storage = this._getStorage();

    // Si se alcanza el tamaño máximo, eliminar las entradas más antiguas
    if (storage instanceof Map && storage.size >= this.cacheState.config.maxSize!) {
      this.evictOldEntries();
    }

    const ttl = options?.ttl ?? this.cacheState.config.defaultTTL!;
    const tags = options?.tags ?? [];

    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now(),
      lastAccessed: Date.now(), // Se actualiza al setear
      tags
    };

    if (storage instanceof Map) {
      storage.set(key, entry);
    } else {
      try {
        storage.setItem(key, JSON.stringify(entry));
      } catch (e) {
        console.error("Error saving cache entry to storage", e);
      }
    }
  }

  /**
   * Elimina una entrada de la caché
   */
  public remove(key: string): void {
    const storage = this._getStorage();
    if (storage instanceof Map) {
      storage.delete(key);
    } else {
      storage.removeItem(key);
    }
  }

  /**
   * Limpia toda la caché
   */
  public clear(): void {
    const storage = this._getStorage();
    if (storage instanceof Map) {
      storage.clear();
    } else {
      // Para localStorage/sessionStorage, solo eliminar las claves de caché
      const keysToRemove: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith('http_cache_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => storage.removeItem(key));
    }
  }

  /**
   * Invalida entradas de caché que coincidan con un patrón
   */
  public invalidate(pattern: string): void {
    const storage = this._getStorage();
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));

    if (storage instanceof Map) {
      for (const key of storage.keys()) {
        if (regex.test(key)) {
          this.remove(key);
        }
      }
    } else {
      const keysToRemove: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && regex.test(key)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => storage.removeItem(key));
    }
  }

  /**
   * Invalida entradas de caché con ciertos tags
   */
  public invalidateByTags(tags: string[]): void {
    if (!tags.length) return;

    const storage = this._getStorage();

    if (storage instanceof Map) {
      for (const [key, entry] of storage.entries()) {
        if (entry.tags && entry.tags.some(tag => tags.includes(tag))) {
          this.remove(key);
        }
      }
    } else {
      const keysToRemove: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith('http_cache_')) { // Solo procesar claves de caché
          try {
            const stored = storage.getItem(key);
            if (stored) {
              const entry: CacheEntry<unknown> = JSON.parse(stored);
              if (entry.tags && entry.tags.some(tag => tags.includes(tag))) {
                keysToRemove.push(key);
              }
            }
          } catch (e) {
            console.error("Error parsing stored cache entry for tag invalidation", e);
            keysToRemove.push(key); // Eliminar entradas corruptas
          }
        }
      }
      keysToRemove.forEach(key => storage.removeItem(key));
    }
  }

  /**
   * Invalida automáticamente caché basado en método HTTP
   */
  public invalidateByMethod(method: HttpMethod, endpoint: string): void {
    if (method === 'GET') {
      return; // GET no invalida caché
    }

    // Extraer recurso base (e.g., /users/1 -> /users)
    const basePath = endpoint.split('/').slice(0, -1).join('/') || endpoint;

    // POST/PUT/PATCH/DELETE en un recurso invalida colecciones y elementos
    this.invalidate(`GET:${basePath}*`);
  }

  /**
   * Debería usar caché para esta petición?
   */
  public shouldUseCache(method: HttpMethod, options?: RequestOptions): boolean {
    // Si la caché está deshabilitada globalmente
    if (!this.cacheState.config.enabled) {
      return false;
    }

    // Si la petición específica desactiva la caché
    if (options?.cache?.enabled === false) {
      return false;
    }

    // Solo se cachean peticiones GET por defecto
    return method === 'GET';
  }

  /**
   * Obtiene la estrategia de caché a utilizar
   */
  public getStrategy(options?: RequestOptions): CacheStrategy {
    return options?.cache?.strategy || this.cacheState.config.defaultStrategy!;
  }

  /**
   * Elimina las entradas más antiguas para hacer espacio
   */
  private evictOldEntries(): void {
    // Ordenar por último acceso (más antiguo primero)
    const entries = Array.from(this.cacheState.cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);

    // Eliminar el 10% más antiguo
    const toRemove = Math.ceil(this.cacheState.config.maxSize! * 0.1);
    entries.slice(0, toRemove).forEach(([key]) => this.remove(key));
  }
}
