/**
 * Busca recursivamente un valor dentro de un objeto o array anidado
 * que satisfaga una función de predicado. Devuelve el primer valor encontrado.
 *
 * @param data El objeto o array donde buscar.
 * @param predicate Una función que recibe un valor y devuelve `true` si es el valor buscado.
 * @param visited Un Set para evitar ciclos infinitos en estructuras con referencias circulares (uso interno).
 * @returns El primer valor que satisface el predicado, o `undefined` si no se encuentra.
 */
export function deepFindLazy<T = any>(
  data: unknown,
  predicate: (value: unknown) => boolean,
  visited = new Set<unknown>()
): T | undefined {
  // Evitar procesamiento si no hay datos o ya se visitó (prevención de ciclos)
  if (data === null || data === undefined || visited.has(data)) {
    return undefined;
  }

  // Aplicar el predicado al nodo actual
  if (predicate(data)) {
    return data as T;
  }

  // Marcar como visitado si es un objeto o array
  if (typeof data === 'object') {
    visited.add(data);
  }

  // Recorrer si es un objeto
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    for (const key in data) {
      // Asegurarse de que es una propiedad propia del objeto
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = (data as Record<string, unknown>)[key];
        const found = deepFindLazy<T>(value, predicate, visited);
        if (found !== undefined) {
          return found; // Devolver inmediatamente si se encuentra en la rama
        }
      }
    }
  }
  // Recorrer si es un array
  else if (Array.isArray(data)) {
    for (const item of data) {
      const found = deepFindLazy<T>(item, predicate, visited);
      if (found !== undefined) {
        return found; // Devolver inmediatamente si se encuentra en la rama
      }
    }
  }

  // No encontrado en esta rama
  return undefined;
}
