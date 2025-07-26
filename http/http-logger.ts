import { ApiResponse } from "./types/core.types";
import { DebugLevel } from "./http-config";

export interface LoggerConfig {
  enabled: boolean;
  level: DebugLevel;
  format?: "console" | "json";
  colors?: boolean;
}

export class HttpLogger {
  private static instance: HttpLogger;
  private config: LoggerConfig = {
    enabled: true,
    level: DebugLevel.ERROR,
    format: "console",
    colors: true,
  };

  private constructor() {}

  static getInstance(): HttpLogger {
    if (!HttpLogger.instance) {
      HttpLogger.instance = new HttpLogger();
    }
    return HttpLogger.instance;
  }

  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  logError(response: ApiResponse<unknown>): void {
    if (!this.config.enabled || this.config.level < DebugLevel.ERROR) return;

    const { error, status, details } = response;
    if (!error) return;

    const errorInfo = {
      message: error,
      status,
      details: details
        ? {
            description: details.description,
            cause: details.cause,
            solution: details.solution,
          }
        : undefined,
    };

    if (this.config.format === "json") {
      console.error(JSON.stringify(errorInfo, null, 2));
    } else {
      this.logFormattedError(errorInfo);
    }
  }

  private logFormattedError(errorInfo: {
    message: string;
    status: number;
    details?: {
      description: string;
      cause: string;
      solution: string;
    };
  }): void {
    const { message, status, details } = errorInfo;
    const prefix = this.config.colors ? "\x1b[31m" : ""; // Red color
    const suffix = this.config.colors ? "\x1b[0m" : ""; // Reset color

    console.error(`${prefix}Error (${status}):${suffix} ${message}`);

    if (details) {
      console.error(`${prefix}Description:${suffix} ${details.description}`);
      console.error(`${prefix}Cause:${suffix} ${details.cause}`);
      console.error(`${prefix}Solution:${suffix} ${details.solution}`);
    }
  }
}

export const httpLogger = HttpLogger.getInstance();
