import { ILoggerAdapter, LogLevel } from './types/logger.http-interface';
export interface LoggerConfig {
    level?: LogLevel;
    adapters?: ILoggerAdapter[];
}
export declare class Logger {
    private static instance;
    private adapters;
    private level;
    private constructor();
    static getInstance(): Logger;
    configure(config: LoggerConfig): void;
    addAdapter(adapter: ILoggerAdapter): void;
    log(level: LogLevel, message: string, context?: Record<string, any>): void;
    debug(message: string, context?: Record<string, any>): void;
    info(message: string, context?: Record<string, any>): void;
    warn(message: string, context?: Record<string, any>): void;
    error(message: string, context?: Record<string, any>): void;
    private shouldLog;
}
export declare const logger: Logger;
