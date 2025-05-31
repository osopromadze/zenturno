import { Request, Response, NextFunction } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { logger } from '../../../utils/logger';

/**
 * Middleware to handle application errors
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log del error para debugging
  logger.error(error);

  // Manejar errores específicos de Prisma
  if (error instanceof PrismaClientKnownRequestError) {
    // Error P2002: Unique constraint violation
    if ((error as PrismaClientKnownRequestError).code === 'P2002') {
      const field = ((error as PrismaClientKnownRequestError).meta?.target as string[])?.join(', ') || 'a field';
      res.status(409).json({
        success: false,
        message: `A record with the same value for ${field} already exists`,
        error: 'UNIQUE_CONSTRAINT_VIOLATION'
      });
      return;
    }

    // Error P2025: Record not found
    if ((error as PrismaClientKnownRequestError).code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Resource not found',
        error: 'RECORD_NOT_FOUND'
      });
      return;
    }

    // Error P2003: Foreign key constraint violation
    if ((error as PrismaClientKnownRequestError).code === 'P2003') {
      res.status(400).json({
        success: false,
        message: 'Invalid reference to a related record',
        error: 'FOREIGN_KEY_CONSTRAINT_VIOLATION'
      });
      return;
    }

    // Error P2014: Relation violation
    if ((error as PrismaClientKnownRequestError).code === 'P2014') {
      res.status(400).json({
        success: false,
        message: 'Violation of relationship between records',
        error: 'RELATION_VIOLATION'
      });
      return;
    }

    // Otros errores de Prisma
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: (error as PrismaClientKnownRequestError).code
    });
    return;
  }

  // Manejar errores de validación
  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: error.message,
      error: 'VALIDATION_ERROR'
    });
    return;
  }

  // Manejar errores de autenticación
  if (error.name === 'UnauthorizedError') {
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
      error: 'UNAUTHORIZED'
    });
    return;
  }

  // Manejar errores de autorización
  if (error.name === 'ForbiddenError') {
    res.status(403).json({
      success: false,
      message: 'Access forbidden',
      error: 'FORBIDDEN'
    });
    return;
  }

  // Error genérico para cualquier otro tipo de error
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_SERVER_ERROR'
  });
};