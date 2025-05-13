/**
 * Utilidades HTTP compartidas entre cliente y servidor
 */

/**
 * Construye una URL completa concatenando la base URL y el endpoint
 * @param baseUrl URL base (puede incluir ruta)
 * @param endpoint Endpoint o ruta relativa
 * @returns URL completa
 */
export function buildUrl(baseUrl: string, endpoint: string): string {
  // Si el endpoint ya es una URL completa, devolverlo tal cual
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  // Normalizar URL base y endpoint para evitar barras duplicadas
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  return `${normalizedBase}${normalizedEndpoint}`;
}

/**
 * Combina headers por defecto con headers personalizados
 * @param defaultHeaders Headers por defecto
 * @param customHeaders Headers personalizados
 * @returns Headers combinados
 */
export function mergeHeaders(
  defaultHeaders: Record<string, string> = {},
  customHeaders: Record<string, string> = {}
): Record<string, string> {
  return { ...defaultHeaders, ...customHeaders };
}

/**
 * Añade parámetros de consulta a una URL
 * @param url URL base
 * @param params Parámetros de consulta
 * @returns URL con parámetros
 */
export function addQueryParams(
  url: string,
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  if (!params) return url;

  // Filtrar valores nulos o indefinidos
  const validParams = Object.entries(params).filter(([_, value]) =>
    value !== undefined && value !== null
  );

  if (validParams.length === 0) return url;

  const queryString = validParams
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  // Añadir el separador adecuado (? o &)
  const separator = url.includes('?') ? '&' : '?';

  return `${url}${separator}${queryString}`;
}

/**
 * Genera una clave de caché basada en la URL y los parámetros
 * @param method Método HTTP
 * @param url URL
 * @param data Datos de la solicitud (para métodos POST, PUT, etc.)
 * @returns Clave de caché
 */
export function generateCacheKey(method: string, url: string, data?: any): string {
  const normalizedMethod = method.toUpperCase();

  if (!data || ['GET', 'HEAD', 'OPTIONS'].includes(normalizedMethod)) {
    return `${normalizedMethod}:${url}`;
  }

  // Para métodos con cuerpo, incluir un hash del cuerpo en la clave
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);
  const dataHash = hashString(dataString);

  return `${normalizedMethod}:${url}:${dataHash}`;
}

/**
 * Genera un hash simple para una cadena
 * @param str Cadena a hashear
 * @returns Hash de la cadena
 */
export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a entero de 32 bits
  }
  return Math.abs(hash).toString(16);
}

/**
 * Detecta si el código está ejecutándose en un entorno Node.js o navegador
 * @returns true si es Node.js, false si es navegador
 */
export function isNodeEnvironment(): boolean {
  return (
    typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null
  );
}

/**
 * Parsea el string de un error para extraer un mensaje más amigable
 * @param error Error capturado
 * @returns Mensaje de error legible
 */
export function parseErrorMessage(error: any): string {
  if (!error) return 'Error desconocido';

  if (typeof error === 'string') return error;

  if (error.message) return error.message;

  if (error.status && error.statusText) {
    return `${error.status}: ${error.statusText}`;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return 'Error inesperado';
  }
}
