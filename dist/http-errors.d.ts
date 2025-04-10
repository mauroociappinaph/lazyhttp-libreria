export declare class HttpError extends Error {
    suggestion?: string;
    static ERROR_MESSAGES: Record<string, string>;
    static getSmartSuggestion(error: HttpError, request?: Request): Promise<string>;
    static provideSuggestionFeedback(error: HttpError, request: Request | undefined, suggestion: string, wasHelpful: boolean): Promise<void>;
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
