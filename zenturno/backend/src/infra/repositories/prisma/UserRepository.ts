import { prisma } from '../../db/prisma';
import { User } from '@prisma/client';
import { logger } from '../../../utils/logger';

export interface CreateUserInput {
    name: string;
    email: string;
    password: string;
    role?: string;
}

export interface UpdateUserInput {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
}

export class UserRepository {
    /**
     * Find a user by ID
     */
    async findById(id: number): Promise<User | null> {
        try {
            return await prisma.user.findUnique({
                where: { id }
            });
        } catch (error) {
            logger.error(`Error finding user by ID: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Find a user by email
     */
    async findByEmail(email: string): Promise<User | null> {
        try {
            return await prisma.user.findUnique({
                where: { email }
            });
        } catch (error) {
            logger.error(`Error finding user by email: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Create a new user
     */
    async create(data: CreateUserInput): Promise<User> {
        try {
            return await prisma.user.create({
                data
            });
        } catch (error) {
            logger.error(`Error creating user: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Update an existing user
     */
    async update(id: number, data: UpdateUserInput): Promise<User> {
        try {
            return await prisma.user.update({
                where: { id },
                data
            });
        } catch (error) {
            logger.error(`Error updating user: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Delete a user
     */
    async delete(id: number): Promise<User> {
        try {
            return await prisma.user.delete({
                where: { id }
            });
        } catch (error) {
            logger.error(`Error deleting user: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Find all users
     */
    async findAll(): Promise<User[]> {
        try {
            return await prisma.user.findMany();
        } catch (error) {
            logger.error(`Error finding all users: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Find users by role
     */
    async findByRole(role: string): Promise<User[]> {
        try {
            return await prisma.user.findMany({
                where: { role }
            });
        } catch (error) {
            logger.error(`Error finding users by role: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
}
