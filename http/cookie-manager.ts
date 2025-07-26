import { CookieOptions } from "./types/auth.types";

/**
 * Clase para manejar cookies de forma segura
 */
export class CookieManager {
  /**
   * Establece una cookie con las opciones especificadas
   * @param name Nombre de la cookie
   * @param value Valor de la cookie
   * @param options Opciones de la cookie
   */
  static set(name: string, value: string, options: CookieOptions = {}): void {
    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (options.maxAge) {
      cookie += `; max-age=${options.maxAge}`;
    }

    if (options.expires) {
      cookie += `; expires=${options.expires.toUTCString()}`;
    }

    if (options.domain) {
      cookie += `; domain=${options.domain}`;
    }

    if (options.path) {
      cookie += `; path=${options.path}`;
    }

    if (options.secure) {
      cookie += "; secure";
    }

    if (options.httpOnly) {
      cookie += "; httpOnly";
    }

    if (options.sameSite) {
      cookie += `; samesite=${options.sameSite}`;
    }

    document.cookie = cookie;
  }

  /**
   * Obtiene el valor de una cookie por su nombre
   * @param name Nombre de la cookie
   * @returns Valor de la cookie o null si no existe
   */
  static get(name: string): string | null {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.split("=").map((c) => c.trim());
      if (cookieName === name) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  }

  /**
   * Elimina una cookie por su nombre
   * @param name Nombre de la cookie
   * @param options Opciones de la cookie (necesarias para eliminar correctamente)
   */
  static remove(name: string, options: CookieOptions = {}): void {
    const deleteOptions = {
      ...options,
      maxAge: 0,
      expires: new Date(0),
    };
    this.set(name, "", deleteOptions);
  }

  /**
   * Verifica si una cookie existe
   * @param name Nombre de la cookie
   * @returns true si la cookie existe, false en caso contrario
   */
  static exists(name: string): boolean {
    return this.get(name) !== null;
  }
}
