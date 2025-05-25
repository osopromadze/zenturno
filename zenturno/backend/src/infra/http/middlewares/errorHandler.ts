import { Request, Response, NextFunction } from 'express';
import { logger } from '../../../utils/logger';

// Tipo para errores con código de estado HTTP
interface HttpError extends Error {
  status?: number;
  statusCode?: number;
}

/**
 * Middleware para manejo centralizado de errores
 */
export const errorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Determinar el código de estado HTTP
  const statusCode = err.status || err.statusCode || 500;
  
  // Determinar si es un error de servidor (500+) o del cliente (400-499)
  const isServerError = statusCode >= 500;
  
  // Los errores de servidor se registran con nivel 'error'
  if (isServerError) {
    logger.error('Server Error', {
      error: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userId: (req as any).user?.id
    });
  } else {
    // Los errores del cliente se registran con nivel 'warn'
    logger.warn('Client Error', {
      error: err.message,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userId: (req as any).user?.id
    });
  }
  
  // En desarrollo, se envía el stack trace
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  // Enviar respuesta al cliente
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Se ha producido un error',
    stack: isDevelopment ? err.stack : undefined
  });
}; 