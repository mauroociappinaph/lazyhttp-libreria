import { API_URL } from '../../http-config';

/**
 * Construye una URL completa combinando base y endpoint
 * @param endpoint Endpoint o URL relativa
 * @returns URL completa
 */
export function buildUrl(endpoint: string): string {
  // Si ya es una URL completa, devolverla directamente
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  // Asegurar que no hay barras duplicadas en la unión
  const baseWithoutTrailingSlash = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const endpointWithoutLeadingSlash = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

  return `${baseWithoutTrailingSlash}/${endpointWithoutLeadingSlash}`;
}

/**
 * Añade parámetros de consulta a una URL
 * @param url URL base
 * @param params Parámetros de consulta
 * @returns URL con parámetros
 */
export function addQueryParams(url: string, params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) {
    return url;
  }

  // Filtrar valores nulos o indefinidos
  const filteredParams = Object.entries(params).filter(([_, value]) =>
    value !== undefined && value !== null
  );

  if (filteredParams.length === 0) {
    return url;
  }

  const queryString = filteredParams.map(([key, value]) =>
    `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
  ).join('&');

  // Añadir ? o & según corresponda
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${queryString}`;
}

/**
 * Normaliza una ruta asegurando que comience con /
 * @param path Ruta a normalizar
 * @returns Ruta normalizada
 */
export function normalizePath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

/**
 * Une segmentos de ruta asegurando que no hay barras duplicadas
 * @param segments Segmentos de ruta
 * @returns Ruta combinada
 */
export function joinPaths(...segments: string[]): string {
  return segments
    .filter(segment => segment !== '')
    .map((segment, index) => {
      // Eliminar barras iniciales excepto para el primer segmento
      if (index > 0 && segment.startsWith('/')) {
        segment = segment.slice(1);
      }
      // Eliminar barras finales excepto para el último segmento
      if (index < segments.length - 1 && segment.endsWith('/')) {
        segment = segment.slice(0, -1);
      }
      return segment;
    })
    .join('/');
}
