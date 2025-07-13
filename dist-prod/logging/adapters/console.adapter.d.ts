import { ILoggerAdapter, LogEntry } from '../types/logger.http-interface';
export declare class ConsoleLoggerAdapter implements ILoggerAdapter {
    log(entry: LogEntry): void;
}
