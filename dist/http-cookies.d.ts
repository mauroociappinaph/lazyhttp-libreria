/**
 * Módulo para manejo de cookies en LazyHTTP
 */
/**
 * Opciones para establecer cookies
 */
export interface CookieOptions {
    /**
     * Tiempo de vida de la cookie en segundos
     */
    maxAge?: number;
    /**
     * Fecha de expiración de la cookie
     */
    expires?: Date;
    /**
     * Dominio para la cookie
     */
    domain?: string;
    /**
     * Ruta para la cookie
     */
    path?: string;
    /**
     * Si la cookie debe ser segura (solo HTTPS)
     */
    secure?: boolean;
    /**
     * Si la cookie debe ser accesible solo por HTTP (no JavaScript)
     */
    httpOnly?: boolean;
    /**
     * Política de SameSite para la cookie
     */
    sameSite?: 'Strict' | 'Lax' | 'None';
}
/**
 * Clase para manejar cookies en LazyHTTP
 */
export declare class CookieManager {
    /**
     * Establece una cookie
     * @param name Nombre de la cookie
     * @param value Valor de la cookie
     * @param options Opciones de la cookie
     */
    static set(name: string, value: string, options?: CookieOptions): void;
    /**
     * Obtiene el valor de una cookie
     * @param name Nombre de la cookie
     * @returns Valor de la cookie o null si no existe
     */
    static get(name: string): string | null;
    /**
     * Elimina una cookie
     * @param name Nombre de la cookie
     * @param options Opciones adicionales para la eliminación
     */
    static remove(name: string, options?: Pick<CookieOptions, 'domain' | 'path'>): void;
    /**
     * Verifica si una cookie existe
     * @param name Nombre de la cookie
     * @returns true si la cookie existe, false en caso contrario
     */
    static exists(name: string): boolean;
    /**
     * Obtiene todas las cookies como un objeto
     * @returns Objeto con todas las cookies
     */
    static getAll(): Record<string, string>;
}
