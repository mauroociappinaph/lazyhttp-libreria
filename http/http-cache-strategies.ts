import { ApiResponse, RequestOptions } from "./types/core.types";
import { CacheOptions } from "./types/cache.types";
import { httpCacheManager as cache } from "./client/managers/http-cache-manager";

/**
 * Tipo para una función de red que obtiene datos
 */
export type NetworkFetcher<T> = () => Promise<ApiResponse<T>>;

/**
 * Ejecuta una estrategia cache-first
 * Intenta usar caché, si no existe o expiró va a la red
 */
export async function cacheFirst<T>(
  cacheKey: string,
  networkFetcher: NetworkFetcher<T>,
  options?: CacheOptions
): Promise<ApiResponse<T>> {
  // Intentar obtener de caché
  const cachedResponse = cache.get<T>(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Si no está en caché o expiró, obtener de la red
  try {
    const response = await networkFetcher();

    // Guardar en caché solo si la respuesta fue exitosa
    if (!response.error) {
      cache.set<T>(cacheKey, response, options);
    }

    return response;
  } catch (error) {
    return {
      data: null,
      error: `Error obteniendo datos: ${error instanceof Error ? error.message : String(error)}`,
      status: 0,
    };
  }
}

/**
 * Ejecuta una estrategia network-first
 * Intenta usar la red, si falla usa caché
 */
export async function networkFirst<T>(
  cacheKey: string,
  networkFetcher: NetworkFetcher<T>,
  options?: CacheOptions
): Promise<ApiResponse<T>> {
  try {
    // Intentar obtener de la red
    const response = await networkFetcher();

    // Guardar en caché solo si la respuesta fue exitosa
    if (!response.error) {
      cache.set<T>(cacheKey, response, options);
    }

    return response;
  } catch (error) {
    // En caso de error, intentar usar caché
    const cachedResponse = cache.get<T>(cacheKey);
    if (cachedResponse) {
      // Agregar un metadata para indicar que se está usando caché
      return {
        ...cachedResponse,
        meta: {
          ...(cachedResponse.meta || {}),
          fromCache: true,
          networkError: String(error),
        },
      };
    }

    // Si no hay caché, devolver error
    return {
      data: null,
      error: `Error obteniendo datos: ${error instanceof Error ? error.message : String(error)}`,
      status: 0,
    };
  }
}

/**
 * Ejecuta una estrategia stale-while-revalidate
 * Usa caché mientras refresca en segundo plano
 */
export async function staleWhileRevalidate<T>(
  cacheKey: string,
  networkFetcher: NetworkFetcher<T>,
  options?: CacheOptions
): Promise<ApiResponse<T>> {
  // Intentar obtener de caché
  const cachedResponse = cache.get<T>(cacheKey);

  // Actualizar en segundo plano sin esperar
  const updateCache = async () => {
    try {
      const freshResponse = await networkFetcher();

      // Guardar en caché solo si la respuesta fue exitosa
      if (!freshResponse.error) {
        cache.set<T>(cacheKey, freshResponse, options);
      }
    } catch (error) {
      // Ignorar errores en la actualización en segundo plano
      console.warn(`Error actualizando caché: ${error}`);
    }
  };

  // Si hay datos en caché, devolver inmediatamente y actualizar en segundo plano
  if (cachedResponse) {
    // No esperamos que termine la actualización
    updateCache();

    return {
      ...cachedResponse,
      meta: {
        ...(cachedResponse.meta || {}),
        fromCache: true,
        refreshing: true,
      },
    };
  }

  // Si no hay datos en caché, esperar la red
  try {
    const response = await networkFetcher();

    // Guardar en caché solo si la respuesta fue exitosa
    if (!response.error) {
      cache.set<T>(cacheKey, response, options);
    }

    return response;
  } catch (error) {
    return {
      data: null,
      error: `Error obteniendo datos: ${error instanceof Error ? error.message : String(error)}`,
      status: 0,
    };
  }
}

/**
 * Ejecuta una estrategia network-only
 * Solo usa la red, nunca la caché
 */
export async function networkOnly<T>(
  cacheKey: string,
  networkFetcher: NetworkFetcher<T>,
  options?: CacheOptions
): Promise<ApiResponse<T>> {
  try {
    const response = await networkFetcher();

    // Guardar en caché solo si la respuesta fue exitosa y está configurado para ello
    // Esto puede ser útil para la invalidación automática
    if (!response.error && options?.enabled !== false) {
      cache.set<T>(cacheKey, response, options);
    }

    return response;
  } catch (error) {
    return {
      data: null,
      error: `Error obteniendo datos: ${error instanceof Error ? error.message : String(error)}`,
      status: 0,
    };
  }
}

/**
 * Ejecuta una estrategia cache-only
 * Solo usa la caché, nunca la red
 */
export async function cacheOnly<T>(cacheKey: string): Promise<ApiResponse<T>> {
  // Intentar obtener de caché
  const cachedResponse = cache.get<T>(cacheKey);

  if (cachedResponse) {
    return cachedResponse;
  }

  // Si no hay datos en caché, devolver error
  return {
    data: null,
    error: "No hay datos en caché",
    status: 404,
  };
}

/**
 * Ejecuta la estrategia de caché apropiada según las opciones
 */
export async function executeWithCacheStrategy<T>(
  cacheKey: string,
  networkFetcher: NetworkFetcher<T>,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  const strategy = cache.getStrategy(options);

  switch (strategy) {
    case "cache-first":
      return cacheFirst(cacheKey, networkFetcher, options?.cache);

    case "network-first":
      return networkFirst(cacheKey, networkFetcher, options?.cache);

    case "stale-while-revalidate":
      return staleWhileRevalidate(cacheKey, networkFetcher, options?.cache);

    case "network-only":
      return networkOnly(cacheKey, networkFetcher, options?.cache);

    case "cache-only":
      return cacheOnly(cacheKey);

    default:
      // Si por alguna razón la estrategia no es válida, usar cache-first como fallback
      return cacheFirst(cacheKey, networkFetcher, options?.cache);
  }
}
