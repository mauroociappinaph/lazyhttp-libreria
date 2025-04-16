/**
 * HTTP proxy exports - Individual proxy exports for easier imports
 */
import { http } from './http-exports';

// Exportar la función de configuración de proxy para un uso más directo
export const configureProxy = http.configureProxy.bind(http);
