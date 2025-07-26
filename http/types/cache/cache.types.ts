import { ApiResponse } from "../core/response.types";

/**
 * Estrategias de caché disponibles
 */
export type CacheStrategy =
  | "cache-first" // Intenta usar caché, si no existe o expiró va a la red
  | "network-first" // Intenta usar la red, si falla usa caché
  | "stale-while-revalidate" // Usa caché mientras refresca en segundo plano
  | "network-only" // Solo usa la red, nunca la caché
  | "cache-only"; // Solo usa la caché, nunca la red

/**
 * Tipos de almacenamiento para la caché
 */
export type CacheStorageType = "memory" | "localStorage" | "indexedDB";

/**
 * Opciones para configurar caché en peticiones específicas
 */
export interface CacheOptions {
  /**
   * Indica si se debe usar la caché para esta petición
   * @default true si la caché global está habilitada
   */
  enabled?: boolean;

  /**
   * Estrategia de caché a utilizar
   * @default La estrategia global configurada
   */
  strategy?: CacheStrategy;

  /**
   * Tiempo de vida de la entrada en caché (en milisegundos)
   * @default El TTL global configurado
   */
  ttl?: number;

  /**
   * Clave de caché personalizada (por defecto se genera a partir del endpoint y parámetros)
   */
  key?: string;

  /**
   * Tags para agrupar entradas de caché para invalidación
   */
  tags?: string[];
}

/**
 * Configuración global para el sistema de caché
 */
export interface CacheConfig {
  /**
   * Indica si la caché está habilitada globalmente
   * @default false
   */
  enabled: boolean;

  /**
   * Estrategia de caché por defecto
   * @default 'cache-first'
   */
  defaultStrategy?: CacheStrategy;

  /**
   * Tiempo de vida por defecto (en milisegundos)
   * @default 5 * 60 * 1000 (5 minutos)
   */
  defaultTTL?: number;

  /**
   * Tipo de almacenamiento para la caché
   * @default 'memory'
   */
  storage?: CacheStorageType;

  /**
   * Tamaño máximo de la caché (número de entradas)
   * @default 100
   */
  maxSize?: number;
}

/**
 * Entrada en la caché
 */
export interface CacheEntry<T> {
  /**
   * Valor almacenado en caché
   */
  value: ApiResponse<T>;

  /**
   * Timestamp de expiración
   */
  expiresAt: number;

  /**
   * Timestamp de creación
   */
  createdAt: number;

  /**
   * Timestamp de último acceso
   */
  lastAccessed: number;

  /**
   * Tags asociados
   */
  tags?: string[];
}
