import {
  ILoggerAdapter,
  LogEntry,
  LogLevel,
} from "./types/logger.http-interface";

export interface LoggerConfig {
  level?: LogLevel;
  adapters?: ILoggerAdapter[];
}

export class Logger {
  private static instance: Logger;
  private adapters: ILoggerAdapter[] = [];
  private level: LogLevel = "info";

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  configure(config: LoggerConfig): void {
    if (config.level) this.level = config.level;
    if (config.adapters) this.adapters = config.adapters;
  }

  addAdapter(adapter: ILoggerAdapter): void {
    this.adapters.push(adapter);
  }

  log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (this.shouldLog(level)) {
      const entry: LogEntry = {
        timestamp: Date.now(),
        level,
        message,
        context,
      };
      this.adapters.forEach((adapter) => adapter.log(entry));
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log("debug", message, context);
  }
  info(message: string, context?: Record<string, any>): void {
    this.log("info", message, context);
  }
  warn(message: string, context?: Record<string, any>): void {
    this.log("warn", message, context);
  }
  error(message: string, context?: Record<string, any>): void {
    this.log("error", message, context);
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["debug", "info", "warn", "error"];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }
}

export const logger = Logger.getInstance();
