import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { logger } from '../../../utils/logger';

// Extender el tipo Request para incluir el usuario
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                email: string;
                rol: string;
            };
        }
    }
}

/**
 * Middleware to verify JWT authentication
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // Obtener el token del header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            res.status(401).json({
                success: false,
                message: 'No authentication token provided'
            });
            return;
        }

        // Verificar formato del token (Bearer token)
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            res.status(401).json({
                success: false,
                message: 'Invalid token format'
            });
            return;
        }

        const token = parts[1];

        // Verificar y decodificar el token
        const decoded = verify(token, process.env.JWT_SECRET || 'default_secret');

        // Agregar información del usuario al request
        req.user = {
            id: (decoded as any).id,
            email: (decoded as any).email,
            rol: (decoded as any).rol
        };

        // Continuar con la siguiente función en la cadena
        next();
    } catch (error) {
        logger.error('Error en authenticate middleware:', { message: error instanceof Error ? error.message : String(error) });

        // Determinar el tipo de error para dar una respuesta más específica
        if ((error as Error).name === 'TokenExpiredError') {
            res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        } else if ((error as Error).name === 'JsonWebTokenError') {
            res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
};
