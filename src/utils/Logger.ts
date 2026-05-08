/* eslint-disable @typescript-eslint/no-explicit-any */

enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Simple structured logger that prefixes messages with log level labels
 * and delegates to the appropriate console method.
 */
export class Logger {
  /**
   * Internal logging method that formats and dispatches a log entry.
   *
   * @param level   - The severity level of the log entry
   * @param message - The log message text
   * @param data    - Optional structured data to include with the entry
   */
  private log(level: LogLevel, message: string, data?: any): void {
    const logMessage = `[${level}] ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, data || '');
        break;
      case LogLevel.INFO:
        console.info(logMessage, data || '');
        break;
      case LogLevel.WARN:
        console.warn(logMessage, data || '');
        break;
      case LogLevel.ERROR:
        console.error(logMessage, data || '');
        break;
    }
  }

  /**
   * Logs a debug-level message.
   *
   * @param message - The log message text
   * @param data    - Optional structured data to include with the entry
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Logs an info-level message.
   *
   * @param message - The log message text
   * @param data    - Optional structured data to include with the entry
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Logs a warning-level message.
   *
   * @param message - The log message text
   * @param data    - Optional structured data to include with the entry
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Logs an error-level message.
   *
   * @param message - The log message text
   * @param data    - Optional structured data to include with the entry
   */
  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }
}
