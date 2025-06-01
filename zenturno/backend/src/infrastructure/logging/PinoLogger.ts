import { Logger } from '@domain/shared/Logger';
import { logger as pinoLogger } from '@utils/logger';

/**
 * Pino implementation of the Logger interface
 * 
 * This is an adapter in the Hexagonal Architecture that implements
 * the Logger port using Pino for logging operations.
 */
export class PinoLogger implements Logger {
  /**
   * Logs debug information
   * @param message The message to log
   * @param options Optional metadata to include
   */
  debug(message: string, options?: { [key: string]: any }): void {
    pinoLogger.debug(message, options);
  }
  
  /**
   * Logs informational messages
   * @param message The message to log
   * @param options Optional metadata to include
   */
  info(message: string, options?: { [key: string]: any }): void {
    pinoLogger.info(message, options);
  }
  
  /**
   * Logs warning messages
   * @param message The message to log
   * @param options Optional metadata to include
   */
  warn(message: string, options?: { [key: string]: any }): void {
    pinoLogger.warn(message, options);
  }
  
  /**
   * Logs error messages
   * @param message The message to log or an Error object
   * @param options Optional metadata to include
   */
  error(message: string | Error, options?: { [key: string]: any }): void {
    pinoLogger.error(message, options);
  }
}
