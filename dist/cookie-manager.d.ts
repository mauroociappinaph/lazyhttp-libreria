import { CookieOptions } from './types/auth.types';
export declare class CookieManager {
    static set(name: string, value: string, options?: CookieOptions): void;
    static get(name: string): string | null;
    static remove(name: string, options?: CookieOptions): void;
    static exists(name: string): boolean;
}
