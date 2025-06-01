/**
 * Logger Interface
 * 
 * Defines the contract for logging operations throughout the application.
 * This is a port in the Hexagonal Architecture that allows the domain to
 * use logging without depending on specific implementations.
 */

type LogOptions = {
  [key: string]: any;
};

export interface Logger {
  /**
   * Logs debug information
   * @param message The message to log
   * @param options Optional metadata to include
   */
  debug(message: string, options?: LogOptions): void;
  
  /**
   * Logs informational messages
   * @param message The message to log
   * @param options Optional metadata to include
   */
  info(message: string, options?: LogOptions): void;
  
  /**
   * Logs warning messages
   * @param message The message to log
   * @param options Optional metadata to include
   */
  warn(message: string, options?: LogOptions): void;
  
  /**
   * Logs error messages
   * @param message The message to log or an Error object
   * @param options Optional metadata to include
   */
  error(message: string | Error, options?: LogOptions): void;
}
