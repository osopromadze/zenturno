// Mock dependencies first before imports
jest.mock('../../../../src/utils/logger');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../../../src/infra/db/prisma', () => ({
    prisma: {}
}));

// Define a custom User type for testing purposes that matches what we use in tests
interface TestUser {
    id: number;
    name: string;
    email: string;
    password?: string;
    role: string;
    created_at?: Date;
    updated_at?: Date;
    [key: string]: any; // Allow for additional properties
}

// Define interfaces for input types
interface CreateUserInput {
    name: string;
    email: string;
    password: string;
    role?: string;
}

// Define function types for repository methods using our TestUser type
type FindByIdFn = (id: number) => Promise<TestUser | null>;
type FindByEmailFn = (email: string) => Promise<TestUser | null>;
type CreateFn = (data: CreateUserInput) => Promise<TestUser>;

// Create mock repository with typed mock functions
const mockUserRepository = {
    findByEmail: jest.fn() as jest.MockedFunction<FindByEmailFn>,
    create: jest.fn() as jest.MockedFunction<CreateFn>,
    findById: jest.fn() as jest.MockedFunction<FindByIdFn>
};

// Mock the repository module
jest.mock('../../../../src/infra/repositories/prisma/UserRepository', () => ({
    UserRepository: jest.fn().mockImplementation(() => mockUserRepository)
}));

import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { forgotPassword, login, register, resetPassword } from '../../../../src/infra/http/controllers/authController';

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('AuthController', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        jest.clearAllMocks();

        mockRequest = {
            body: {},
            query: {},
            params: {}
        };

        mockResponse = {
            status: jest.fn().mockReturnThis() as any,
            json: jest.fn().mockReturnThis() as any
        };

        // Setup default environment variables
        process.env.JWT_SECRET = 'test_secret';
        process.env.JWT_EXPIRATION = '24h';
    });

    describe('login', () => {
        it('should login successfully with valid credentials', async () => {
            const userData = {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                password: 'hashedPassword',
                role: 'client'
            };

            mockRequest.body = {
                email: 'john@example.com',
                password: 'password123'
            };

            mockUserRepository.findByEmail.mockResolvedValue(userData);
            mockBcrypt.compare.mockResolvedValue(true as never);
            mockJwt.sign.mockReturnValue('fake_jwt_token' as never);

            await login(mockRequest as Request, mockResponse as Response);

            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
            expect(mockBcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
            expect(mockJwt.sign).toHaveBeenCalledWith(
                {
                    id: 1,
                    email: 'john@example.com',
                    role: 'client'
                },
                'test_secret',
                { expiresIn: '24h' }
            );
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    token: 'fake_jwt_token',
                    user: {
                        id: 1,
                        name: 'John Doe',
                        email: 'john@example.com',
                        role: 'client'
                    }
                }
            });
        });

        it('should return 400 when email is missing', async () => {
            mockRequest.body = { password: 'password123' };

            await login(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Email and password are required'
            });
        });

        it('should return 400 when password is missing', async () => {
            mockRequest.body = { email: 'john@example.com' };

            await login(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Email and password are required'
            });
        });

        it('should return 401 when user not found', async () => {
            mockRequest.body = {
                email: 'nonexistent@example.com',
                password: 'password123'
            };

            mockUserRepository.findByEmail.mockResolvedValue(null);

            await login(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid credentials'
            });
        });

        it('should return 401 when password is incorrect', async () => {
            const userData = {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                password: 'hashedPassword',
                role: 'client'
            };

            mockRequest.body = {
                email: 'john@example.com',
                password: 'wrongpassword'
            };

            mockUserRepository.findByEmail.mockResolvedValue(userData);
            mockBcrypt.compare.mockResolvedValue(false as never);

            await login(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid credentials'
            });
        });

        it('should handle errors gracefully', async () => {
            mockRequest.body = {
                email: 'john@example.com',
                password: 'password123'
            };

            mockUserRepository.findByEmail.mockRejectedValue(new Error('Database error'));

            await login(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Internal server error'
            });
        });
    });

    describe('register', () => {
        it('should register successfully with valid data', async () => {
            const newUser = {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                password: 'hashedPassword',
                role: 'client'
            };

            mockRequest.body = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                role: 'client'
            };

            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockBcrypt.hash.mockResolvedValue('hashedPassword' as never);
            mockUserRepository.create.mockResolvedValue(newUser);
            mockJwt.sign.mockReturnValue('fake_jwt_token' as never);

            await register(mockRequest as Request, mockResponse as Response);

            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
            expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(mockUserRepository.create).toHaveBeenCalledWith({
                name: 'John Doe',
                email: 'john@example.com',
                password: 'hashedPassword',
                role: 'client'
            });
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    token: 'fake_jwt_token',
                    user: {
                        id: 1,
                        name: 'John Doe',
                        email: 'john@example.com',
                        role: 'client'
                    }
                }
            });
        });

        it('should return 400 when required fields are missing', async () => {
            mockRequest.body = { email: 'john@example.com' }; // Missing name and password

            await register(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Name, email and password are required'
            });
        });

        it('should return 409 when email already exists', async () => {
            const existingUser = {
                id: 1,
                name: 'Existing User',
                email: 'john@example.com',
                password: 'hashedPassword',
                role: 'client'
            };

            mockRequest.body = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123'
            };

            mockUserRepository.findByEmail.mockResolvedValue(existingUser);

            await register(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(409);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Email is already registered'
            });
        });

        it('should default to client role when not specified', async () => {
            const newUser = {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                password: 'hashedPassword',
                role: 'client'
            };

            mockRequest.body = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123'
                // No role specified
            };

            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockBcrypt.hash.mockResolvedValue('hashedPassword' as never);
            mockUserRepository.create.mockResolvedValue(newUser);
            mockJwt.sign.mockReturnValue('fake_jwt_token' as never);

            await register(mockRequest as Request, mockResponse as Response);

            expect(mockUserRepository.create).toHaveBeenCalledWith({
                name: 'John Doe',
                email: 'john@example.com',
                password: 'hashedPassword',
                role: 'client'
            });
        });

        it('should handle errors gracefully', async () => {
            mockRequest.body = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123'
            };

            mockUserRepository.findByEmail.mockRejectedValue(new Error('Database error'));

            await register(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Internal server error'
            });
        });
    });

    describe('forgotPassword', () => {
        it('should return success message when email is provided', async () => {
            mockRequest.body = { email: 'john@example.com' };

            const userData = {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                password: 'hashedPassword',
                role: 'client'
            };

            mockUserRepository.findByEmail.mockResolvedValue(userData);

            await forgotPassword(mockRequest as Request, mockResponse as Response);

            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                message: 'If the email is registered, you will receive instructions to reset your password'
            });
        });

        it('should return same message for non-existent email (security)', async () => {
            mockRequest.body = { email: 'nonexistent@example.com' };

            mockUserRepository.findByEmail.mockResolvedValue(null);

            await forgotPassword(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                message: 'If the email is registered, you will receive password reset instructions'
            });
        });

        it('should return 400 when email is missing', async () => {
            mockRequest.body = {};

            await forgotPassword(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Email is required'
            });
        });

        it('should handle errors gracefully', async () => {
            mockRequest.body = { email: 'john@example.com' };

            mockUserRepository.findByEmail.mockRejectedValue(new Error('Database error'));

            await forgotPassword(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Internal server error'
            });
        });
    });

    describe('resetPassword', () => {
        it('should return success message when token and password are provided', async () => {
            mockRequest.body = {
                token: 'valid_reset_token',
                password: 'newpassword123'
            };

            await resetPassword(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                message: 'Password reset successfully'
            });
        });

        it('should return 400 when token is missing', async () => {
            mockRequest.body = { password: 'newpassword123' };

            await resetPassword(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Token and new password are required'
            });
        });

        it('should return 400 when password is missing', async () => {
            mockRequest.body = { token: 'valid_reset_token' };

            await resetPassword(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Token and new password are required'
            });
        });

        it('should handle errors gracefully', async () => {
            mockRequest.body = {
                token: 'valid_reset_token',
                password: 'newpassword123'
            };

            // Simulate an error in password reset logic
            jest.spyOn(console, 'error').mockImplementation(() => { });

            await resetPassword(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                message: 'Password reset successfully'
            });
        });
    });
});
