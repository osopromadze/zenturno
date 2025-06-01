import { PrismaClient } from '@prisma/client';
import { User } from '@domain/user/User';
import { Email } from '@domain/user/Email';
import { UserRepository } from '@domain/user/UserRepository';
import { Logger } from '@domain/shared/Logger';

/**
 * Prisma implementation of the UserRepository interface
 * 
 * This is an adapter in the Hexagonal Architecture that implements
 * the UserRepository port using Prisma ORM for database access.
 */
export class PrismaUserRepository implements UserRepository {
  private prisma: PrismaClient;
  private logger: Logger;

  /**
   * Constructor with dependency injection
   * @param prisma Prisma client for database access
   * @param logger Logger for logging operations
   */
  constructor(prisma: PrismaClient, logger: Logger) {
    this.prisma = prisma;
    this.logger = logger;
  }

  /**
   * Finds a user by their ID
   * @param id User ID
   * @returns User entity if found, null otherwise
   */
  async findById(id: number): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id }
      });

      if (!user) {
        return null;
      }

      return User.reconstitute(
        user.id,
        user.name,
        user.email,
        user.password,
        user.role,
        user.created_at,
        user.updated_at
      );
    } catch (error) {
      this.logger.error(`Error finding user by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Finds a user by their email
   * @param email Email value object
   * @returns User entity if found, null otherwise
   */
  async findByEmail(email: Email): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: email.getValue() }
      });

      if (!user) {
        return null;
      }

      return User.reconstitute(
        user.id,
        user.name,
        user.email,
        user.password,
        user.role,
        user.created_at,
        user.updated_at
      );
    } catch (error) {
      this.logger.error(`Error finding user by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Saves a new user to the database
   * @param user User entity to save
   * @returns Saved user with ID assigned
   */
  async save(user: User): Promise<User> {
    try {
      const userData = {
        name: user.getName(),
        email: user.getEmail().getValue(),
        password: user.getPassword().getValue(),
        role: user.getRole().getValue(),
        created_at: user.getCreatedAt(),
        updated_at: user.getUpdatedAt()
      };

      const savedUser = await this.prisma.user.create({
        data: userData
      });

      return User.reconstitute(
        savedUser.id,
        savedUser.name,
        savedUser.email,
        savedUser.password,
        savedUser.role,
        savedUser.created_at,
        savedUser.updated_at
      );
    } catch (error) {
      this.logger.error(`Error saving user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Updates an existing user in the database
   * @param user User entity to update
   * @returns Updated user
   */
  async update(user: User): Promise<User> {
    try {
      const userId = user.getId();
      
      if (userId === null) {
        throw new Error('Cannot update user without ID');
      }

      const userData = {
        name: user.getName(),
        email: user.getEmail().getValue(),
        password: user.getPassword().getValue(),
        role: user.getRole().getValue(),
        updated_at: new Date() // Ensure updated_at is set to now
      };

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: userData
      });

      return User.reconstitute(
        updatedUser.id,
        updatedUser.name,
        updatedUser.email,
        updatedUser.password,
        updatedUser.role,
        updatedUser.created_at,
        updatedUser.updated_at
      );
    } catch (error) {
      this.logger.error(`Error updating user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Deletes a user from the database
   * @param id ID of the user to delete
   * @returns true if deleted, false if not found
   */
  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.prisma.user.delete({
        where: { id }
      });

      return !!result;
    } catch (error) {
      // If the error is because the user doesn't exist, return false
      if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
        return false;
      }
      
      this.logger.error(`Error deleting user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Retrieves all users with pagination
   * @param page Page number (default: 1)
   * @param limit Number of users per page (default: 10)
   * @returns Array of user entities
   */
  async findAll(page: number = 1, limit: number = 10): Promise<User[]> {
    try {
      const skip = (page - 1) * limit;
      
      const users = await this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { id: 'asc' }
      });

      return users.map(user => 
        User.reconstitute(
          user.id,
          user.name,
          user.email,
          user.password,
          user.role,
          user.created_at,
          user.updated_at
        )
      );
    } catch (error) {
      this.logger.error(`Error finding all users: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Checks if an email already exists in the database
   * @param email Email value object to check
   * @returns true if exists, false otherwise
   */
  async existsByEmail(email: Email): Promise<boolean> {
    try {
      const count = await this.prisma.user.count({
        where: { email: email.getValue() }
      });

      return count > 0;
    } catch (error) {
      this.logger.error(`Error checking if email exists: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}
