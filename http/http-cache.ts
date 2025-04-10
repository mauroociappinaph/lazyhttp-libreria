import {
  ApiResponse,
  CacheConfig,
  CacheEntry,
  CacheOptions,
  CacheStrategy,
  HttpMethod,
  RequestOptions,
  CacheStorageType
} from './http.types';

// Estado interno del caché
const cacheState = {
  config: {
    enabled: false,
    defaultStrategy: 'cache-first' as CacheStrategy,
    defaultTTL: 5 * 60 * 1000, // 5 minutos
    storage: 'memory' as CacheStorageType,
    maxSize: 100
  },
  cache: new Map<string, CacheEntry<any>>()
};

/**
 * Configura el sistema de caché
 */
export function configure(config: Partial<CacheConfig>): void {
  cacheState.config = { ...cacheState.config, ...config };

  // Si se deshabilita la caché, limpiarla
  if (!cacheState.config.enabled) {
    clear();
  }
}

/**
 * Verifica si la caché está habilitada
 */
export function isEnabled(): boolean {
  return cacheState.config.enabled;
}

/**
 * Genera una clave de caché a partir de un endpoint y opciones
 */
export function generateCacheKey(endpoint: string, options?: RequestOptions): string {
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
 * Obtiene una entrada de la caché
 */
export function get<T>(key: string): ApiResponse<T> | undefined {
  const entry = cacheState.cache.get(key);

  if (!entry) {
    return undefined;
  }

  // Verificar si ha expirado
  if (Date.now() > entry.expiresAt) {
    remove(key);
    return undefined;
  }

  // Actualizar timestamp de último acceso
  entry.lastAccessed = Date.now();
  cacheState.cache.set(key, entry);

  return entry.value;
}

/**
 * Almacena un valor en la caché
 */
export function set<T>(key: string, value: ApiResponse<T>, options?: CacheOptions): void {
  if (!cacheState.config.enabled) {
    return;
  }

  // Si se alcanza el tamaño máximo, eliminar las entradas más antiguas
  if (cacheState.cache.size >= cacheState.config.maxSize!) {
    evictOldEntries();
  }

  const ttl = options?.ttl ?? cacheState.config.defaultTTL!;
  const tags = options?.tags ?? [];

  const entry: CacheEntry<T> = {
    value,
    expiresAt: Date.now() + ttl,
    createdAt: Date.now(),
    lastAccessed: Date.now(),
    tags
  };

  cacheState.cache.set(key, entry);
}

/**
 * Elimina una entrada de la caché
 */
export function remove(key: string): void {
  cacheState.cache.delete(key);
}

/**
 * Limpia toda la caché
 */
export function clear(): void {
  cacheState.cache.clear();
}

/**
 * Invalida entradas de caché que coincidan con un patrón
 */
export function invalidate(pattern: string): void {
  const regex = new RegExp(pattern.replace(/\*/g, '.*'));

  for (const key of cacheState.cache.keys()) {
    if (regex.test(key)) {
      remove(key);
    }
  }
}

/**
 * Invalida entradas de caché con ciertos tags
 */
export function invalidateByTags(tags: string[]): void {
  for (const [key, entry] of cacheState.cache.entries()) {
    if (entry.tags && entry.tags.some(tag => tags.includes(tag))) {
      remove(key);
    }
  }
}

/**
 * Invalida automáticamente caché basado en método HTTP
 */
export function invalidateByMethod(method: HttpMethod, endpoint: string): void {
  if (method === 'GET') {
    return; // GET no invalida caché
  }

  // Extraer recurso base (e.g., /users/1 -> /users)
  const basePath = endpoint.split('/').slice(0, -1).join('/') || endpoint;

  // POST/PUT/PATCH/DELETE en un recurso invalida colecciones y elementos
  invalidate(`GET:${basePath}*`);
}

/**
 * Debería usar caché para esta petición?
 */
export function shouldUseCache(method: HttpMethod, options?: RequestOptions): boolean {
  // Si la caché está deshabilitada globalmente
  if (!cacheState.config.enabled) {
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
export function getStrategy(options?: RequestOptions): CacheStrategy {
  return options?.cache?.strategy || cacheState.config.defaultStrategy!;
}

/**
 * Elimina las entradas más antiguas para hacer espacio
 */
function evictOldEntries(): void {
  // Ordenar por último acceso (más antiguo primero)
  const entries = Array.from(cacheState.cache.entries())
    .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);

  // Eliminar el 10% más antiguo
  const toRemove = Math.ceil(cacheState.config.maxSize! * 0.1);
  entries.slice(0, toRemove).forEach(([key]) => remove(key));
}

// Exportar todo en un objeto para mantener compatibilidad con la API anterior
export const cacheManager = {
  configure,
  isEnabled,
  generateCacheKey,
  get,
  set,
  delete: remove, // Renombrar para evitar colisión con keyword
  clear,
  invalidate,
  invalidateByTags,
  invalidateByMethod,
  shouldUseCache,
  getStrategy
};
