export declare const logger: {
    error(message: string, data?: unknown): void;
    warn(message: string, data?: unknown): void;
    info(message: string, data?: unknown): void;
    debug(message: string, data?: unknown): void;
    _log(level: "error" | "warning" | "info" | "debug", message: string, data?: unknown): void;
};
export declare function logRequest(method: string, url: string, headers: Record<string, string>, body: unknown): void;
export declare function logResponse(response: any): void;
