export interface CookieOptions {
    maxAge?: number;
    expires?: Date;
    domain?: string;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
}
export declare class CookieManager {
    static set(name: string, value: string, options?: CookieOptions): void;
    static get(name: string): string | null;
    static remove(name: string, options?: Pick<CookieOptions, 'domain' | 'path'>): void;
    static exists(name: string): boolean;
    static getAll(): Record<string, string>;
}
