/**
 * HTTP streaming exports - Individual streaming exports for easier imports
 */
import { http } from './http-exports';

// Exportar la función de streaming para un uso más directo
export const stream = http.stream.bind(http);
