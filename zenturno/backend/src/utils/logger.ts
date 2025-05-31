/**
 * Simple logger utility for consistent logging throughout the application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  [key: string]: any;
}

class Logger {
  private logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  private currentLevel: LogLevel;

  constructor() {
    // Set log level from environment variable or default to 'info'
    this.currentLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
  }

  /**
   * Check if the given log level should be logged based on the current log level
   */
  private shouldLog(level: LogLevel): boolean {
    return this.logLevels[level] >= this.logLevels[this.currentLevel];
  }

  /**
   * Format a log message with timestamp, level, and optional metadata
   */
  private formatMessage(level: LogLevel, message: string, options?: LogOptions): string {
    const timestamp = new Date().toISOString();
    const levelUpper = level.toUpperCase();

    let formattedMessage = `[${timestamp}] [${levelUpper}] ${message}`;

    if (options && Object.keys(options).length > 0) {
      formattedMessage += ` ${JSON.stringify(options)}`;
    }

    return formattedMessage;
  }

  /**
   * Log a debug message
   */
  debug(message: string, options?: LogOptions): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, options));
    }
  }

  /**
   * Log an info message
   */
  info(message: string, options?: LogOptions): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, options));
    }
  }

  /**
   * Log a warning message
   */
  warn(message: string, options?: LogOptions): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, options));
    }
  }

  /**
   * Log an error message
   */
  error(message: string | Error, options?: LogOptions): void {
    if (this.shouldLog('error')) {
      if (message instanceof Error) {
        const errorMessage = `${message.message}\n${message.stack}`;
        console.error(this.formatMessage('error', errorMessage, options));
      } else {
        console.error(this.formatMessage('error', message, options));
      }
    }
  }
}

// Export a singleton instance
export const logger = new Logger();