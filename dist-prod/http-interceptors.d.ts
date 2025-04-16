import { AxiosInstance } from 'axios';
export declare function setupInterceptors(instance?: AxiosInstance): void;
export declare function refreshToken(): Promise<string>;
export declare function handleRefreshTokenFailure(): void;
export declare const authInterceptors: {
    setupInterceptors: typeof setupInterceptors;
    refreshToken: typeof refreshToken;
    handleRefreshTokenFailure: typeof handleRefreshTokenFailure;
};
