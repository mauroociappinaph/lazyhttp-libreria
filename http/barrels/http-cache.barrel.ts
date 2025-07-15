/**
 * Sub-barril para componentes de caché
 */

// Caché
export { cacheManager } from '../http-cache';
export { executeWithCacheStrategy } from '../http-cache-strategies';

// Tipos relacionados con caché
export {
  CacheConfig,
  CacheStrategy
} from '../types/cache.types';
