/**
 * HTTP methods exports - Individual method exports for easier imports
 */
import { http } from './http-exports';

// Exportar las funciones individuales para un uso más directo
export const request = http.request.bind(http);
export const get = http.get.bind(http);
export const getAll = http.getAll.bind(http);
export const getById = http.getById.bind(http);
export const post = http.post.bind(http);
export const put = http.put.bind(http);
export const patch = http.patch.bind(http);
export const del = http.delete.bind(http); // 'delete' es palabra reservada en JavaScript

// Exportar streaming
export const stream = http.stream.bind(http);
