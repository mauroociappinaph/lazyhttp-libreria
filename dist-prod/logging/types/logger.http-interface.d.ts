export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export interface LogEntry {
    timestamp: number;
    level: LogLevel;
    message: string;
    context?: Record<string, any>;
}
export interface ILoggerAdapter {
    log(entry: LogEntry): void | Promise<void>;
}
