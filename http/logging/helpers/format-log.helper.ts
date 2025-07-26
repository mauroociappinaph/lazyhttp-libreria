import { LogEntry } from "../types/logger.http-interface";

export function formatLogEntry(entry: LogEntry): string {
  const { timestamp, level, message, context } = entry;
  const time = new Date(timestamp).toISOString();
  let logMsg = `[${time}] [${level.toUpperCase()}] ${message}`;
  if (context) {
    logMsg += ` | Context: ${JSON.stringify(context)}`;
  }
  return logMsg;
}
