export declare const configureAuth: (config: import("../../http.types").AuthConfig) => void;
export declare const login: (credentials: import("../../http.types").UserCredentials) => Promise<import("../../http.types").AuthInfo>;
export declare const logout: () => Promise<void>;
export declare const isAuthenticated: () => boolean;
export declare const getAuthenticatedUser: () => Promise<any | null>;
export declare const getAccessToken: () => string | null;
