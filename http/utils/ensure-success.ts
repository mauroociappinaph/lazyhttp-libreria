/**
 * Lanza una excepción si la respuesta de HttpLazy contiene error.
 * Útil para compatibilidad con librerías que esperan promesas rechazadas (React Query, SWR, etc).
 *
 * @template T Tipo de datos esperados en la respuesta
 * @param response Respuesta de HttpLazy
 * @returns Los datos de la respuesta si no hay error
 * @throws Error enriquecido con información de error y status si existe error
 */
export function ensureSuccess<T>(response: {
  data: T;
  error?: { message: string; code?: string; details?: any };
  status: number;
}): T {
  if (response.error)
    throw Object.assign(new Error(response.error.message), response.error, {
      status: response.status,
    });
  return response.data;
}
