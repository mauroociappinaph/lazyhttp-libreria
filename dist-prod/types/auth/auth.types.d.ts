export type AuthType = 'jwt' | 'oauth2' | 'basic' | 'session';
export interface CookieOptions {
    maxAge?: number;
    expires?: Date;
    domain?: string;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
}
export type StorageType = 'cookie' | 'localStorage' | 'sessionStorage';
export interface AuthConfig {
    baseURL: string;
    loginEndpoint: string;
    logoutEndpoint: string;
    userInfoEndpoint?: string;
    refreshEndpoint?: string;
    tokenKey: string;
    refreshTokenKey: string;
    storage: StorageType;
    cookieOptions?: CookieOptions;
    onLogin?: (response: AuthResponse) => void;
    onLogout?: () => void;
    onError?: (error: any) => void;
}
export interface UserCredentials {
    username: string;
    password: string;
    [key: string]: any;
}
export interface AuthInfo {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: number;
    user?: any;
    isAuthenticated: boolean;
}
export interface AuthResponse {
    access_token: string;
    refresh_token?: string;
    token_type?: string;
    expires_in?: number;
}
