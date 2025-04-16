import { AuthConfig, UserCredentials, AuthInfo } from '../../http.types';
export declare class HttpAuthManager {
    configureAuth(config: AuthConfig): void;
    login(credentials: UserCredentials): Promise<AuthInfo>;
    logout(): Promise<void>;
    isAuthenticated(): boolean;
    getAuthenticatedUser(): Promise<any | null>;
    getAccessToken(): string | null;
    refreshToken(): Promise<string>;
    handleRefreshTokenFailure(): Promise<void>;
    decodeToken(token: string): any;
    isTokenExpired(token: string | number): boolean;
    storeToken(key: string, value: string): void;
    getToken(key: string): string | null;
    removeToken(key: string): void;
}
