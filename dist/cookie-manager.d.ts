import { CookieOptions } from './http.types';
/**
 * Clase para manejar cookies de forma segura
 */
export declare class CookieManager {
    /**
     * Establece una cookie con las opciones especificadas
     * @param name Nombre de la cookie
     * @param value Valor de la cookie
     * @param options Opciones de la cookie
     */
    static set(name: string, value: string, options?: CookieOptions): void;
    /**
     * Obtiene el valor de una cookie por su nombre
     * @param name Nombre de la cookie
     * @returns Valor de la cookie o null si no existe
     */
    static get(name: string): string | null;
    /**
     * Elimina una cookie por su nombre
     * @param name Nombre de la cookie
     * @param options Opciones de la cookie (necesarias para eliminar correctamente)
     */
    static remove(name: string, options?: CookieOptions): void;
    /**
     * Verifica si una cookie existe
     * @param name Nombre de la cookie
     * @returns true si la cookie existe, false en caso contrario
     */
    static exists(name: string): boolean;
}
