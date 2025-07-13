import { BaseHttpClient } from '../../common/core/base-http-client';
import { HttpMethod, ApiResponse, RequestOptions, AuthInfo, UserCredentials } from '../../common/types';
export declare class NodeHttpClient extends BaseHttpClient {
    private tokenStorage;
    private cacheDirectory;
    private httpAgent;
    private httpsAgent;
    constructor();
    protected onInitialize(config: any): void;
    request<T>(method: HttpMethod, url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>;
    private _createProxyAgent;
    login(credentials: UserCredentials): Promise<AuthInfo>;
    logout(): Promise<void>;
    isAuthenticated(): boolean;
    getAuthenticatedUser(): any | null;
    getAccessToken(): string | null;
    invalidateCache(pattern: string): void;
    invalidateCacheByTags(tags: string[]): void;
    trackActivity(type: string): void;
    getCurrentMetrics(): any;
    private setupCacheDirectory;
    private getCacheFiles;
    private _storeToken;
    private _getToken;
    private _removeToken;
    private _decodeToken;
    private _isTokenExpired;
}
