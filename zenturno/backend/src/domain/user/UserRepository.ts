import { User } from './User';
import { Email } from './Email';

/**
 * UserRepository Interface (Port)
 * 
 * Defines the contract for persistence operations related to User entities.
 * This is a port in the Hexagonal Architecture that allows the domain to
 * communicate with the outside world without knowing the implementation details.
 */
export interface UserRepository {
  /**
   * Finds a user by their unique ID
   * @param id The user ID
   * @returns The user entity if found, null otherwise
   */
  findById(id: number): Promise<User | null>;
  
  /**
   * Finds a user by their email
   * @param email The email value object
   * @returns The user entity if found, null otherwise
   */
  findByEmail(email: Email): Promise<User | null>;
  
  /**
   * Saves a new user to the repository
   * @param user The user entity to save
   * @returns The saved user with ID assigned
   */
  save(user: User): Promise<User>;
  
  /**
   * Updates an existing user in the repository
   * @param user The user entity to update
   * @returns The updated user
   */
  update(user: User): Promise<User>;
  
  /**
   * Deletes a user from the repository
   * @param id The ID of the user to delete
   * @returns true if the user was deleted, false otherwise
   */
  delete(id: number): Promise<boolean>;
  
  /**
   * Retrieves all users from the repository
   * @param page Page number (for pagination)
   * @param limit Number of users per page
   * @returns Array of user entities
   */
  findAll(page?: number, limit?: number): Promise<User[]>;
  
  /**
   * Checks if an email is already registered
   * @param email The email value object to check
   * @returns true if the email exists, false otherwise
   */
  existsByEmail(email: Email): Promise<boolean>;
}
