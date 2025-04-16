/**
 * Configuration methods exports - Individual method exports for configuration
 */
import { http } from './http-exports';

// Exportar initialize
export const initialize = http.initialize.bind(http);

// Exportar caché
export const configureCaching = http.configureCaching.bind(http);
export const invalidateCache = http.invalidateCache.bind(http);
export const invalidateCacheByTags = http.invalidateCacheByTags.bind(http);

// Exportar funciones de métricas
export const configureMetrics = http.configureMetrics.bind(http);
export const trackActivity = http.trackActivity.bind(http);
export const getCurrentMetrics = http.getCurrentMetrics.bind(http);
