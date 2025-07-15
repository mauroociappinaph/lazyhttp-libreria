import { ApiResponse } from './core.types';

/**
 * Estrategias de caché soportadas
 */
export type CacheStrategy =
  | 'cache-first'
  | 'network-first'
  | 'stale-while-revalidate'
  | 'network-only'
  | 'cache-only';

/**
 * Modos de almacenamiento de caché
 */
export type CacheStorageType = 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';

/**
 * Opciones de caché para una petición
 */
export interface CacheOptions {
  enabled?: boolean;
  strategy?: CacheStrategy;
  ttl?: number;
  key?: string;
  tags?: string[];
}

/**
 * Configuración global del sistema de caché
 */
export interface CacheConfig {
  enabled: boolean;
  defaultStrategy?: CacheStrategy;
  defaultTTL?: number;
  storage?: CacheStorageType;
  maxSize?: number;
}

/**
 * Entrada de caché
 */
export interface CacheEntry<T> {
  value: ApiResponse<T>;
  expiresAt: number;
  createdAt: number;
  lastAccessed: number;
  tags?: string[];
}
