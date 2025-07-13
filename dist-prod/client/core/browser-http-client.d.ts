import { BaseHttpClient } from '../../common/core/base-http-client';
import { HttpMethod, ApiResponse, RequestOptions, AuthInfo, UserCredentials } from '../../common/types';
export declare class BrowserHttpClient extends BaseHttpClient {
    private tokenStorage;
    request<T>(method: HttpMethod, url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>;
    login(credentials: UserCredentials): Promise<AuthInfo>;
    logout(): Promise<void>;
    isAuthenticated(): boolean;
    getAuthenticatedUser(): any | null;
    getAccessToken(): string | null;
    invalidateCache(pattern: string): void;
    invalidateCacheByTags(tags: string[]): void;
    trackActivity(type: string): void;
    getCurrentMetrics(): any;
    private _storeToken;
    private _getToken;
    private _removeToken;
    private _getStorage;
    private _decodeToken;
    private _isTokenExpired;
}
