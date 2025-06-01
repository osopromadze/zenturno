// Mock dependencies first before imports
jest.mock('../../../../src/utils/logger');
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

interface UpdateUserInput {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
}

// Define function types for repository methods using our TestUser type
type FindByIdFn = (id: number) => Promise<TestUser | null>;
type FindByEmailFn = (email: string) => Promise<TestUser | null>;
type UpdateFn = (id: number, data: UpdateUserInput) => Promise<TestUser | null>; // Allow null returns
type FindAllFn = () => Promise<TestUser[]>;

// Create mock repository with typed mock functions
const mockUserRepository = {
    findById: jest.fn() as jest.MockedFunction<FindByIdFn>,
    findByEmail: jest.fn() as jest.MockedFunction<FindByEmailFn>,
    update: jest.fn() as jest.MockedFunction<UpdateFn>,
    findAll: jest.fn() as jest.MockedFunction<FindAllFn>
};

// Mock the repository module
jest.mock('../../../../src/infra/repositories/prisma/UserRepository', () => ({
    UserRepository: jest.fn().mockImplementation(() => mockUserRepository)
}));

import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Request, Response } from 'express';
import {
    getAllUsers,
    getProfile,
    getUserById,
    updateProfile
} from '../../../../src/infra/http/controllers/userController';

// Custom Request type for testing
interface TestRequest extends Partial<Request> {
    user?: {
        id: number;
        email: string;
        rol: string;
    };
}

describe('UserController', () => {
    let mockRequest: TestRequest;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        jest.clearAllMocks();

        mockRequest = {
            body: {},
            query: {},
            params: {},
            user: { id: 1, email: 'john@example.com', rol: 'client' }
        };

        mockResponse = {
            status: jest.fn().mockReturnThis() as any,
            json: jest.fn().mockReturnThis() as any
        };
    });

    describe('getProfile', () => {
        it('should return user profile successfully', async () => {
            const mockUser = {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                password: 'hashedPassword',
                role: 'client',
                created_at: new Date(),
                updated_at: new Date()
            };

            mockUserRepository.findById.mockResolvedValue(mockUser);

            await getProfile(mockRequest as Request, mockResponse as Response);

            expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    id: 1,
                    name: 'John Doe',
                    email: 'john@example.com',
                    role: 'client',
                    created_at: mockUser.created_at,
                    updated_at: mockUser.updated_at
                }
            });
        });

        it('should return 401 when user is not authenticated', async () => {
            mockRequest.user = undefined;

            await getProfile(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'User not authenticated'
            });
        });

        it('should return 404 when user not found', async () => {
            mockUserRepository.findById.mockResolvedValue(null);

            await getProfile(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'User not found'
            });
        });

        it('should handle errors gracefully', async () => {
            mockUserRepository.findById.mockRejectedValue(new Error('Database error'));

            await getProfile(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Internal server error'
            });
        });
    });

    describe('updateProfile', () => {
        it('should update user profile successfully', async () => {
            const updateData = {
                name: 'John Doe Updated',
                email: 'john.updated@example.com'
            };

            const mockUser = {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                password: 'hashedPassword',
                role: 'client'
            };

            const mockUpdatedUser = { ...mockUser, ...updateData };

            mockRequest.body = updateData;
            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.update.mockResolvedValue(mockUpdatedUser);

            await updateProfile(mockRequest as Request, mockResponse as Response);

            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john.updated@example.com');
            expect(mockUserRepository.update).toHaveBeenCalledWith(1, updateData);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    id: 1,
                    name: 'John Doe Updated',
                    email: 'john.updated@example.com',
                    role: 'client'
                },
                message: 'Profile updated successfully'
            });
        });

        it('should return 401 when user is not authenticated', async () => {
            mockRequest.user = undefined;
            mockRequest.body = { name: 'John Doe' };

            await updateProfile(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'User not authenticated'
            });
        });

        it('should return 400 when no update data provided', async () => {
            mockRequest.body = {};

            await updateProfile(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'No data provided for update'
            });
        });

        it('should return 409 when email is already registered by another user', async () => {
            const existingUser = {
                id: 2,
                name: 'Jane Doe',
                email: 'john.updated@example.com',
                role: 'client'
            };

            mockRequest.body = { email: 'john.updated@example.com' };
            mockUserRepository.findByEmail.mockResolvedValue(existingUser);

            await updateProfile(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(409);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Email is already registered by another user'
            });
        });

        it('should allow updating to same email', async () => {
            const currentUser = {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                role: 'client'
            };

            const mockUpdatedUser = { ...currentUser, name: 'John Doe Updated' };

            mockRequest.body = { name: 'John Doe Updated', email: 'john@example.com' };
            mockUserRepository.findByEmail.mockResolvedValue(currentUser);
            mockUserRepository.update.mockResolvedValue(mockUpdatedUser);

            await updateProfile(mockRequest as Request, mockResponse as Response);

            expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
                name: 'John Doe Updated',
                email: 'john@example.com'
            });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
        });

        it('should return 404 when user not found for update', async () => {
            mockRequest.body = { name: 'John Doe Updated' };
            mockUserRepository.update.mockResolvedValue(null);

            await updateProfile(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'User not found'
            });
        });

        it('should handle partial updates', async () => {
            const mockUser = {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                password: 'hashedPassword',
                role: 'client'
            };

            const mockUpdatedUser = { ...mockUser, name: 'John Doe Updated' };

            mockRequest.body = { name: 'John Doe Updated' }; // Only name update
            mockUserRepository.update.mockResolvedValue(mockUpdatedUser);

            await updateProfile(mockRequest as Request, mockResponse as Response);

            expect(mockUserRepository.update).toHaveBeenCalledWith(1, { name: 'John Doe Updated', email: undefined });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
        });

        it('should handle errors gracefully', async () => {
            mockRequest.body = { name: 'John Doe Updated' };
            mockUserRepository.update.mockRejectedValue(new Error('Database error'));

            await updateProfile(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Internal server error'
            });
        });
    });

    describe('getUserById', () => {
        it('should return user by valid ID', async () => {
            const mockUser = {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                password: 'hashedPassword',
                role: 'client',
                created_at: new Date(),
                updated_at: new Date()
            };

            mockRequest.params = { id: '1' };
            mockUserRepository.findById.mockResolvedValue(mockUser);

            await getUserById(mockRequest as Request, mockResponse as Response);

            expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    id: 1,
                    name: 'John Doe',
                    email: 'john@example.com',
                    role: 'client',
                    created_at: mockUser.created_at,
                    updated_at: mockUser.updated_at
                }
            });
        });

        it('should return 400 for invalid user ID', async () => {
            mockRequest.params = { id: 'invalid' };

            await getUserById(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid user ID'
            });
        });

        it('should return 404 when user not found', async () => {
            mockRequest.params = { id: '999' };
            mockUserRepository.findById.mockResolvedValue(null);

            await getUserById(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'User not found'
            });
        });

        it('should handle errors gracefully', async () => {
            mockRequest.params = { id: '1' };
            mockUserRepository.findById.mockRejectedValue(new Error('Database error'));

            await getUserById(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Internal server error'
            });
        });
    });

    describe('getAllUsers', () => {
        it('should return all users with pagination', async () => {
            const mockUsers = [
                {
                    id: 1,
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'hashedPassword',
                    role: 'client'
                },
                {
                    id: 2,
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    password: 'hashedPassword',
                    role: 'professional'
                }
            ];

            mockRequest.query = { page: '1', limit: '10' };
            mockUserRepository.findAll.mockResolvedValue(mockUsers);

            await getAllUsers(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: [
                    {
                        id: 1,
                        name: 'John Doe',
                        email: 'john@example.com',
                        role: 'client'
                    },
                    {
                        id: 2,
                        name: 'Jane Smith',
                        email: 'jane@example.com',
                        role: 'professional'
                    }
                ],
                pagination: {
                    total: 2,
                    page: 1,
                    limit: 10,
                    pages: 1
                }
            });
        });

        it('should use default pagination when not provided', async () => {
            const mockUsers = [
                {
                    id: 1,
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'hashedPassword',
                    role: 'client'
                }
            ];

            mockUserRepository.findAll.mockResolvedValue(mockUsers);

            await getAllUsers(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: [
                    {
                        id: 1,
                        name: 'John Doe',
                        email: 'john@example.com',
                        role: 'client'
                    }
                ],
                pagination: {
                    total: 1,
                    page: 1,
                    limit: 10,
                    pages: 1
                }
            });
        });

        it('should exclude passwords from response', async () => {
            const mockUsers = [
                {
                    id: 1,
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'secret_password_should_not_be_returned',
                    role: 'client'
                }
            ];

            mockUserRepository.findAll.mockResolvedValue(mockUsers);

            await getAllUsers(mockRequest as Request, mockResponse as Response);

            const responseCall = (mockResponse.json as jest.MockedFunction<any>).mock.calls[0][0];
            expect(responseCall.data[0]).not.toHaveProperty('password');
            expect(responseCall.data[0]).toEqual({
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                role: 'client'
            });
        });

        it('should handle empty user list', async () => {
            mockUserRepository.findAll.mockResolvedValue([]);

            await getAllUsers(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: [],
                pagination: {
                    total: 0,
                    page: 1,
                    limit: 10,
                    pages: 0
                }
            });
        });

        it('should handle errors gracefully', async () => {
            mockUserRepository.findAll.mockRejectedValue(new Error('Database error'));

            await getAllUsers(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Internal server error'
            });
        });
    });
});
