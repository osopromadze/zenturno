import { Request, Response } from 'express';
import { UserRepository } from '../../repositories/prisma/UserRepository';
import { compare, hash } from 'bcrypt';
import { sign, SignOptions } from 'jsonwebtoken';
import { logger } from '../../../utils/logger';

// Singleton instance of UserRepository
const userRepository = new UserRepository();

/**
 * Handles user login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Validate input data
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
            return;
        }

        // Find user by email
        const user = await userRepository.findByEmail(email);
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }

        // Verify password
        const passwordMatch = await compare(password, user.password);
        if (!passwordMatch) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }

        // Generate JWT token
        const token = sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: String(process.env.JWT_EXPIRATION || '24h') } as SignOptions
        );

        // Respond with token and basic user data
        res.status(200).json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        });
    } catch (error) {
        logger.error(`Error in login: ${error instanceof Error ? error.message : String(error)}`);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Handles new user registration
 */
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role = 'client' } = req.body;

        // Validate input data
        if (!name || !email || !password) {
            res.status(400).json({
                success: false,
                message: 'Name, email and password are required'
            });
            return;
        }

        // Check if email is already registered
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            res.status(409).json({
                success: false,
                message: 'Email is already registered'
            });
            return;
        }

        // Encrypt password
        const hashedPassword = await hash(password, 10);

        // Create user
        const newUser = await userRepository.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        // Generate JWT token
        const token = sign(
            {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role
            },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: String(process.env.JWT_EXPIRATION || '24h') } as SignOptions
        );

        // Respond with token and basic user data
        res.status(201).json({
            success: true,
            data: {
                token,
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role
                }
            }
        });
    } catch (error) {
        logger.error(`Error in register: ${error instanceof Error ? error.message : String(error)}`);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Handles password recovery request
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        // Validate input data
        if (!email) {
            res.status(400).json({
                success: false,
                message: 'Email is required'
            });
            return;
        }

        // Verify if user exists
        const user = await userRepository.findByEmail(email);
        if (!user) {
            // For security, do not reveal if the email exists or not
            res.status(200).json({
                success: true,
                message: 'If the email is registered, you will receive password reset instructions'
            });
            return;
        }

        // Here would be the logic to generate a reset token
        // and send an email with instructions
        // For now, we just simulate that the email has been sent

        logger.info(`Password recovery request for: ${email}`);

        res.status(200).json({
            success: true,
            message: 'If the email is registered, you will receive instructions to reset your password'
        });
    } catch (error) {
        logger.error(`Error in forgotPassword: ${error instanceof Error ? error.message : String(error)}`);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Handles password reset
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token, password } = req.body;

        // Validate input data
        if (!token || !password) {
            res.status(400).json({
                success: false,
                message: 'Token and new password are required'
            });
            return;
        }

        // Validate reset token and new password
        // and update user password
        // For now, we just simulate that the password has been changed

        logger.info(`Password reset with token: ${token.substring(0, 10)}...`);

        res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        logger.error(`Error in resetPassword: ${error instanceof Error ? error.message : String(error)}`);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
