export declare class HttpError extends Error {
    static ERROR_MESSAGES: Record<string, string>;
}
export declare class HttpTimeoutError extends HttpError {
    constructor(message?: string);
}
export declare class HttpNetworkError extends HttpError {
    constructor(message?: string);
}
export declare class HttpAxiosError extends HttpError {
    constructor(message?: string);
}
export declare class HttpUnknownError extends HttpError {
    constructor(message?: string);
}
export declare class HttpAbortedError extends HttpError {
    constructor(message?: string);
}
export declare class HttpAuthError extends HttpError {
    constructor(message?: string);
}
