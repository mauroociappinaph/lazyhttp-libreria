export declare enum DebugLevel {
    NONE = 0,
    ERROR = 1,
    WARNING = 2,
    INFO = 3,
    DEBUG = 4
}
export declare const debugConfig: {
    level: DebugLevel;
    logRequests: boolean;
    logResponses: boolean;
    prettyPrintJSON: boolean;
    colors: {
        error: string;
        warning: string;
        info: string;
        debug: string;
        default: string;
    };
};
export declare const API_URL: string;
export declare const DEFAULT_TIMEOUT = 10000;
export declare const DEFAULT_RETRIES = 0;
export declare const AUTH_STORAGE: {
    TOKEN_KEY: string;
    REFRESH_TOKEN_KEY: string;
};
export declare const AUTH_ENDPOINTS: {
    LOGIN: string;
    REGISTER: string;
    REFRESH_TOKEN: string;
    LOGOUT: string;
};
export declare function createAxiosInstance(): import("axios").AxiosInstance;
export declare const httpInstance: import("axios").AxiosInstance;
