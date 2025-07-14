// http/client/utils/create-resource-accessor.ts

/**
 * Crea un accesor de recursos que permite llamadas de función directas y acceso a través de propiedades.
 * Esto permite sintaxis como `client.get('/users')` y `client.get.users()`.
 *
 * @param method - La función a la que se llamará.
 * @param instance - La instancia a la que se vinculará el método.
 * @returns Un proxy que se puede llamar directamente o acceder a través de una propiedad.
 */
export function createResourceAccessor<
  P extends unknown[],
  R
>(
  method: (...args: P) => R,
  instance: object
): {
  (...args: P): R;
  [resource: string]: (...args: P) => R;
  [key: symbol]: (...args: P) => R;
} {
  const accessor = function (...args: P): R {
    return method.apply(instance, args);
  };

  const handler: ProxyHandler<typeof accessor> = {
    get(target, prop) {
      // Permitir el acceso a las propiedades del prototipo de la función
      if (prop in Function.prototype) {
        return (target as never)[prop];
      }
      // Manejar el acceso a recursos (ej. `client.get.users()`)
      return function (...args: P): R {
        const endpoint = args[0];
        const newArgs = [endpoint, ...args.slice(1)] as P;
        return method.apply(instance, newArgs);
      };
    },
    apply(_, __, args) {
      // Manejar la llamada directa (ej. `client.get('/users')`)
      return Reflect.apply(method, instance, args);
    }
  };

  // Crear un proxy para manejar el acceso por corchetes
  return new Proxy(accessor, handler) as {
    (...args: P): R;
    [resource: string]: (...args: P) => R;
    [key: symbol]: (...args: P) => R;
  };
}
