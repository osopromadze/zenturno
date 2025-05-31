import { Request, Response, NextFunction } from 'express';
import { logger } from '../../../utils/logger';

/**
 * Middleware to verify role-based authorization
 * @param allowedRoles Array of allowed roles to access the resource
 */
export const authorize = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            // Verify that the user is authenticated
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            // Verify that the user's role is in the list of allowed roles
            if (!allowedRoles.includes(req.user.rol)) {
                logger.warn(`Access denied: User ${req.user.id} with role ${req.user.rol} attempted to access restricted resource`);

                res.status(403).json({
                    success: false,
                    message: 'You do not have permission to access this resource'
                });
                return;
            }

            // User authorized, continue
            next();
        } catch (error) {
            logger.error('Error in authorize middleware:', { message: error instanceof Error ? error.message : String(error) });
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };
};
