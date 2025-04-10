import { AxiosInstance } from 'axios';
/**
 * Configura los interceptores para la instancia de Axios
 * @param instance Instancia de Axios a configurar
 */
export declare function setupInterceptors(instance?: AxiosInstance): void;
/**
 * Obtiene un nuevo token usando el refresh token
 * @returns Nuevo token de acceso
 */
export declare function refreshToken(): Promise<string>;
/**
 * Maneja el fallo al refrescar el token
 */
export declare function handleRefreshTokenFailure(): void;
export declare const authInterceptors: {
    setupInterceptors: typeof setupInterceptors;
    refreshToken: typeof refreshToken;
    handleRefreshTokenFailure: typeof handleRefreshTokenFailure;
};
