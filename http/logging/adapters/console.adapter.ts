import { ILoggerAdapter, LogEntry } from "../types/logger.http-interface";

export class ConsoleLoggerAdapter implements ILoggerAdapter {
  log(entry: LogEntry): void {
    const { timestamp, level, message, context } = entry;
    const time = new Date(timestamp).toISOString();
    let logMsg = `[${time}] [${level.toUpperCase()}] ${message}`;
    if (context) {
      logMsg += ` | Context: ${JSON.stringify(context)}`;
    }
    switch (level) {
      case "debug":
        // eslint-disable-next-line no-console
        console.debug(logMsg);
        break;
      case "info":
        // eslint-disable-next-line no-console
        console.info(logMsg);
        break;
      case "warn":
        // eslint-disable-next-line no-console
        console.warn(logMsg);
        break;
      case "error":
        // eslint-disable-next-line no-console
        console.error(logMsg);
        break;
      default:
        // eslint-disable-next-line no-console
        console.log(logMsg);
    }
  }
}
