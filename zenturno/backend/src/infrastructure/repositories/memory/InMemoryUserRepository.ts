import { User } from '@domain/user/User';
import { Email } from '@domain/user/Email';
import { UserRepository } from '@domain/user/UserRepository';

/**
 * In-memory implementation of the UserRepository interface
 * 
 * This is an adapter in the Hexagonal Architecture that implements
 * the UserRepository port using an in-memory data structure.
 * It's primarily used for testing and development.
 */
export class InMemoryUserRepository implements UserRepository {
  private users: Map<number, User> = new Map();
  private nextId: number = 1;

  /**
   * Finds a user by their ID
   * @param id User ID
   * @returns User entity if found, null otherwise
   */
  async findById(id: number): Promise<User | null> {
    return this.users.get(id) || null;
  }

  /**
   * Finds a user by their email
   * @param email Email value object
   * @returns User entity if found, null otherwise
   */
  async findByEmail(email: Email): Promise<User | null> {
    const emailValue = email.getValue().toLowerCase();
    
    for (const user of this.users.values()) {
      if (user.getEmail().getValue().toLowerCase() === emailValue) {
        return user;
      }
    }
    
    return null;
  }

  /**
   * Saves a new user to the repository
   * @param user User entity to save
   * @returns Saved user with ID assigned
   */
  async save(user: User): Promise<User> {
    // Clone the user to avoid modifying the original
    const clonedUser = User.create(
      user.getName(),
      user.getEmail(),
      user.getPassword(),
      user.getRole()
    );
    
    // Assign an ID to the user
    const id = this.nextId++;
    clonedUser.setId(id);
    
    // Store the user in the map
    this.users.set(id, clonedUser);
    
    return clonedUser;
  }

  /**
   * Updates an existing user in the repository
   * @param user User entity to update
   * @returns Updated user
   */
  async update(user: User): Promise<User> {
    const userId = user.getId();
    
    if (userId === null) {
      throw new Error('Cannot update user without ID');
    }
    
    if (!this.users.has(userId)) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Store the updated user
    this.users.set(userId, user);
    
    return user;
  }

  /**
   * Deletes a user from the repository
   * @param id ID of the user to delete
   * @returns true if deleted, false if not found
   */
  async delete(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  /**
   * Retrieves all users with pagination
   * @param page Page number (default: 1)
   * @param limit Number of users per page (default: 10)
   * @returns Array of user entities
   */
  async findAll(page: number = 1, limit: number = 10): Promise<User[]> {
    const skip = (page - 1) * limit;
    const users = Array.from(this.users.values());
    
    return users
      .sort((a, b) => (a.getId() || 0) - (b.getId() || 0))
      .slice(skip, skip + limit);
  }

  /**
   * Checks if an email already exists in the repository
   * @param email Email value object to check
   * @returns true if exists, false otherwise
   */
  async existsByEmail(email: Email): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }

  /**
   * Clears all users from the repository
   * Used for testing purposes
   */
  clear(): void {
    this.users.clear();
    this.nextId = 1;
  }
}
