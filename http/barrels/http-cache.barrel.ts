/**
 * Sub-barril para componentes de caché
 */

// Caché
export { httpCacheManager } from '../client/managers/http-cache-manager';
export { executeWithCacheStrategy } from '../http-cache-strategies';

// Tipos relacionados con caché
export {
  CacheConfig,
  CacheStrategy
} from '../types/cache.types';
