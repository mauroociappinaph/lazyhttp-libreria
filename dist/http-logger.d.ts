import { ApiResponse } from './http.types';
import { DebugLevel } from './http-config';
export interface LoggerConfig {
    enabled: boolean;
    level: DebugLevel;
    format?: 'console' | 'json';
    colors?: boolean;
}
export declare class HttpLogger {
    private static instance;
    private config;
    private constructor();
    static getInstance(): HttpLogger;
    configure(config: Partial<LoggerConfig>): void;
    logError(response: ApiResponse<unknown>): void;
    private logFormattedError;
}
export declare const httpLogger: HttpLogger;
