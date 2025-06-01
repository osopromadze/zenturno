import { Request, Response } from 'express';
import { UserRepository } from '../../repositories/prisma/UserRepository';
import { logger } from '../../../utils/logger';
import { prisma } from '../../db/prisma';

// Singleton instance of UserRepository with proper dependencies
const userRepository = new UserRepository(prisma, logger);

/**
 * Retrieves the authenticated user's profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        // The authentication middleware has already verified the token and added the user to the request
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }

        const user = await userRepository.findById(userId);

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        // Return user data without the password
        const { password, ...userData } = user;

        res.status(200).json({
            success: true,
            data: userData
        });
    } catch (error) {
        logger.error(`Error in getProfile: ${error instanceof Error ? error.message : String(error)}`);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Updates the authenticated user's profile
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }

        const { name, email } = req.body;

        // Validate data
        if (!name && !email) {
            res.status(400).json({
                success: false,
                message: 'No data provided for update'
            });
            return;
        }

        // If attempting to update email, verify it doesn't already exist
        if (email) {
            const existingUser = await userRepository.findByEmail(email);
            if (existingUser && existingUser.id !== userId) {
                res.status(409).json({
                    success: false,
                    message: 'Email is already registered by another user'
                });
                return;
            }
        }

        // Update user
        const updatedUser = await userRepository.update(userId, { name, email });

        if (!updatedUser) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        // Return updated user data without the password
        const { password, ...userData } = updatedUser;

        res.status(200).json({
            success: true,
            data: userData,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        logger.error(`Error in updateProfile: ${error instanceof Error ? error.message : String(error)}`);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Retrieves a user by their ID (admin only)
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
            return;
        }

        const user = await userRepository.findById(Number(id));

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        // Return user data without the password
        const { password, ...userData } = user;

        res.status(200).json({
            success: true,
            data: userData
        });
    } catch (error) {
        logger.error(`Error in getUserById: ${error instanceof Error ? error.message : String(error)}`);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Retrieves all users (admin only)
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        // Pagination parameters
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const users = await userRepository.findAll();
        const total = users.length;

        // Remove passwords from results
        const usersData = users.map(user => {
            const { password, ...userData } = user;
            return userData;
        });

        res.status(200).json({
            success: true,
            data: usersData,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        logger.error(`Error in getAllUsers: ${error instanceof Error ? error.message : String(error)}`);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
