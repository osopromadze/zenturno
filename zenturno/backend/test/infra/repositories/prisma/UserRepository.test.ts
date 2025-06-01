import { UserRepository, CreateUserInput, UpdateUserInput } from '../../../../src/infra/repositories/prisma/UserRepository';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { PrismaClient, User } from '@prisma/client';

// Mock Prisma client
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
        },
    })),
}));
const mockPrismaClient = new PrismaClient();

// Mock logger
const mockLogger = {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
};



describe('UserRepository', () => {
    let userRepository: UserRepository;

    beforeEach(() => {
        userRepository = new UserRepository(mockPrismaClient, mockLogger);
        // Reset mocks before each test

        jest.clearAllMocks();
    });

    // Test cases for findById
    describe('#findById', () => {
        it('should return a user if found', async () => {
            // Arrange
            const mockUser: User = {
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                password: 'hashedpassword',
                role: 'client',
                created_at: new Date(),
                updated_at: new Date(),
            };
            jest.mocked(mockPrismaClient.user.findUnique).mockResolvedValue(mockUser);

            // Act
            const result = await userRepository.findById(1);

            // Assert
            expect(result).toEqual(mockUser);
            expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should return null if user not found', async () => {
            // Arrange
            jest.mocked(mockPrismaClient.user.findUnique).mockResolvedValue(null);

            // Act
            const result = await userRepository.findById(999);

            // Assert
            expect(result).toEqual(null);
            expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({ where: { id: 999 } });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            // Arrange
            const error = new Error('Database error');
            jest.mocked(mockPrismaClient.user.findUnique).mockRejectedValue(error);

            // Act & Assert
            await expect(userRepository.findById(1)).rejects.toThrow('Database error');
            expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error finding user by ID: ${error.message}`
            );
        });
    });

    // Test cases for findByEmail
    describe('#findByEmail', () => {
        it('should return a user if found by email', async () => {
            // Arrange
            const mockUser: User = {
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                password: 'hashedpassword',
                role: 'client',
                created_at: new Date(),
                updated_at: new Date(),
            };
            jest.mocked(mockPrismaClient.user.findUnique).mockResolvedValue(mockUser);

            // Act
            const result = await userRepository.findByEmail('test@example.com');

            // Assert
            expect(result).toEqual(mockUser);
            expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should return null if user not found by email', async () => {
            // Arrange
            jest.mocked(mockPrismaClient.user.findUnique).mockResolvedValue(null);

            // Act
            const result = await userRepository.findByEmail('nonexistent@example.com');

            // Assert
            expect(result).toEqual(null);
            expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({ where: { email: 'nonexistent@example.com' } });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            // Arrange
            const error = new Error('Database error');
            jest.mocked(mockPrismaClient.user.findUnique).mockRejectedValue(error);

            // Act & Assert
            await expect(userRepository.findByEmail('test@example.com')).rejects.toThrow('Database error');
            expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error finding user by email: ${error.message}`
            );
        });
    });

    // Test cases for create
    describe('#create', () => {
        it('should create and return a new user', async () => {
            // Arrange
            const createData: CreateUserInput = {
                name: 'New User',
                email: 'new@example.com',
                password: 'newhashedpassword',
                role: 'client', // Ensure role is always a string
            };
            const mockNewUser: User = {
                id: 2,
                name: createData.name,
                email: createData.email,
                password: createData.password,
                role: createData.role || 'client', // Ensure role is always a string
                created_at: new Date(),
                updated_at: new Date(),
            };
            jest.mocked(mockPrismaClient.user.create).mockResolvedValue(mockNewUser);

            // Act
            const result = await userRepository.create(createData);

            // Assert
            expect(result).toEqual(mockNewUser);
            expect(mockPrismaClient.user.create).toHaveBeenCalledWith({ data: createData });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            // Arrange
            const createData: CreateUserInput = {
                name: 'New User',
                email: 'new@example.com',
                password: 'newhashedpassword',
                role: 'client', // Ensure role is always a string
            };
            const error = new Error('Database error');
            jest.mocked(mockPrismaClient.user.create).mockRejectedValue(error);

            // Act & Assert
            await expect(userRepository.create(createData)).rejects.toThrow('Database error');
            expect(mockPrismaClient.user.create).toHaveBeenCalledWith({ data: createData });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error creating user: ${error.message}`
            );
        });
    });

    // Test cases for update
    describe('#update', () => {
        it('should update and return the updated user', async () => {
            // Arrange
            const updateData: UpdateUserInput = {
                name: 'Updated User',
            };
            const mockUpdatedUser: User = {
                id: 1,
                name: 'Updated User',
                email: 'test@example.com',
                password: 'hashedpassword',
                role: 'client', // Ensure role is always a string
                created_at: new Date(),
                updated_at: new Date(),
            };
            jest.mocked(mockPrismaClient.user.update).mockResolvedValue(mockUpdatedUser);

            // Act
            const result = await userRepository.update(1, updateData);

            // Assert
            expect(result).toEqual(mockUpdatedUser);
            expect(mockPrismaClient.user.update).toHaveBeenCalledWith({ where: { id: 1 }, data: updateData });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if user not found for update', async () => {
            // Arrange
            const updateData: UpdateUserInput = { name: 'Nonexistent User' };
            const error = new Error('User not found');
            jest.mocked(mockPrismaClient.user.update).mockRejectedValue(error);

            // Act & Assert
            await expect(userRepository.update(999, updateData)).rejects.toThrow('User not found');
            expect(mockPrismaClient.user.update).toHaveBeenCalledWith({ where: { id: 999 }, data: updateData });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error updating user: ${error.message}`
            );
        });

        it('should throw an error if prisma call fails', async () => {
            // Arrange
            const updateData: UpdateUserInput = { name: 'Updated User' };
            const error = new Error('Database error');
            jest.mocked(mockPrismaClient.user.update).mockRejectedValue(error);

            // Act & Assert
            await expect(userRepository.update(1, updateData)).rejects.toThrow('Database error');
            expect(mockPrismaClient.user.update).toHaveBeenCalledWith({ where: { id: 1 }, data: updateData });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error updating user: ${error.message}`
            );
        });
    });

    // Test cases for delete
    describe('#delete', () => {
        it('should delete and return the deleted user', async () => {
            // Arrange
            const mockDeletedUser: User = {
                id: 1,
                name: 'Deleted User',
                email: 'deleted@example.com',
                password: 'hashedpassword',
                role: 'client', // Ensure role is always a string
                created_at: new Date(),
                updated_at: new Date(),
            };
            jest.mocked(mockPrismaClient.user.delete).mockResolvedValue(mockDeletedUser);

            // Act
            const result = await userRepository.delete(1);

            // Assert
            expect(result).toEqual(mockDeletedUser);
            expect(mockPrismaClient.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if user not found for delete', async () => {
            // Arrange
            const error = new Error('User not found');
            jest.mocked(mockPrismaClient.user.delete).mockRejectedValue(error);

            // Act & Assert
            await expect(userRepository.delete(999)).rejects.toThrow('User not found');
            expect(mockPrismaClient.user.delete).toHaveBeenCalledWith({ where: { id: 999 } });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error deleting user: ${error.message}`
            );
        });

        it('should throw an error if prisma call fails', async () => {
            // Arrange
            const error = new Error('Database error');
            jest.mocked(mockPrismaClient.user.delete).mockRejectedValue(error);

            // Act & Assert
            await expect(userRepository.delete(1)).rejects.toThrow('Database error');
            expect(mockPrismaClient.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error deleting user: ${error.message}`
            );
        });
    });

    // Test cases for findAll
    describe('#findAll', () => {
        it('should return an array of all users', async () => {
            // Arrange
            const mockUsers: User[] = [
                {
                    id: 1,
                    name: 'User One',
                    email: 'user1@example.com',
                    password: 'hashedpassword1',
                    role: 'client', // Ensure role is always a string
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: 2,
                    name: 'User Two',
                    email: 'user2@example.com',
                    password: 'hashedpassword2',
                    role: 'professional', // Ensure role is always a string
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ];
            jest.mocked(mockPrismaClient.user.findMany).mockResolvedValue(mockUsers);

            // Act
            const result = await userRepository.findAll();

            // Assert
            expect(result).toEqual(mockUsers);
            expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith();
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should return an empty array if no users found', async () => {
            // Arrange
            jest.mocked(mockPrismaClient.user.findMany).mockResolvedValue([]);

            // Act
            const result = await userRepository.findAll();

            // Assert
            expect(result).toEqual([]);
            expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith();
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            // Arrange
            const error = new Error('Database error');
            jest.mocked(mockPrismaClient.user.findMany).mockRejectedValue(error);

            // Act & Assert
            await expect(userRepository.findAll()).rejects.toThrow('Database error');
            expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith();
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error finding all users: ${error.message}`
            );
        });
    });

    // Test cases for findByRole
    describe('#findByRole', () => {
        it('should return an array of users with the specified role', async () => {
            // Arrange
            const mockUsers: User[] = [
                {
                    id: 1,
                    name: 'User One',
                    email: 'user1@example.com',
                    password: 'hashedpassword1',
                    role: 'client', // Ensure role is always a string
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ];
            jest.mocked(mockPrismaClient.user.findMany).mockResolvedValue(mockUsers);

            // Act
            const result = await userRepository.findByRole('client');

            // Assert
            expect(result).toEqual(mockUsers);
            expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith({ where: { role: 'client' } });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should return an empty array if no users found for the role', async () => {
            // Arrange
            jest.mocked(mockPrismaClient.user.findMany).mockResolvedValue([]);

            // Act
            const result = await userRepository.findByRole('admin');

            // Assert
            expect(result).toEqual([]);
            expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith({ where: { role: 'admin' } });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            // Arrange
            const error = new Error('Database error');
            jest.mocked(mockPrismaClient.user.findMany).mockRejectedValue(error);

            // Act & Assert
            await expect(userRepository.findByRole('client')).rejects.toThrow('Database error');
            expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith({ where: { role: 'client' } });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error finding users by role: ${error.message}`
            );
        });
    });
});
