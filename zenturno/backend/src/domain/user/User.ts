import { Email } from './Email';
import { Password } from './Password';
import { UserRole } from './UserRole';

/**
 * User Entity
 * 
 * Core domain entity representing a user in the system.
 * Contains business logic and rules related to user management.
 */
export class User {
  private id: number | null;
  private name: string;
  private email: Email;
  private password: Password;
  private role: UserRole;
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(
    id: number | null,
    name: string,
    email: Email,
    password: Password,
    role: UserRole,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Creates a new User entity for registration
   * @param name User's name
   * @param email User's email as a value object
   * @param password User's password as a value object
   * @param role User's role (defaults to CLIENT)
   */
  public static create(
    name: string,
    email: Email,
    password: Password,
    role: UserRole = UserRole.getDefault()
  ): User {
    if (!name || name.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }

    const now = new Date();
    
    return new User(
      null, // ID is null for new users until persisted
      name.trim(),
      email,
      password,
      role,
      now,
      now
    );
  }

  /**
   * Reconstructs a User entity from persistence (database)
   * This is used by repositories to recreate the entity from stored data
   */
  public static reconstitute(
    id: number,
    name: string,
    email: string,
    hashedPassword: string,
    role: string,
    createdAt: Date,
    updatedAt: Date
  ): User {
    return new User(
      id,
      name,
      Email.create(email),
      Password.fromHashed(hashedPassword),
      UserRole.fromString(role),
      createdAt,
      updatedAt
    );
  }

  // Getters
  public getId(): number | null {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getEmail(): Email {
    return this.email;
  }

  public getPassword(): Password {
    return this.password;
  }

  public getRole(): UserRole {
    return this.role;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Domain methods
  
  /**
   * Updates the user's name
   * @param name New name
   */
  public updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }
    
    this.name = name.trim();
    this.updatedAt = new Date();
  }

  /**
   * Updates the user's email
   * @param email New email as a value object
   */
  public updateEmail(email: Email): void {
    this.email = email;
    this.updatedAt = new Date();
  }

  /**
   * Updates the user's password
   * @param password New password as a value object
   */
  public updatePassword(password: Password): void {
    this.password = password;
    this.updatedAt = new Date();
  }

  /**
   * Updates the user's role
   * @param role New role as a value object
   */
  public updateRole(role: UserRole): void {
    this.role = role;
    this.updatedAt = new Date();
  }

  /**
   * Checks if the user has a specific role
   * @param role Role to check
   */
  public hasRole(role: UserRole): boolean {
    return this.role.equals(role);
  }

  /**
   * Verifies if the provided password matches the user's password
   * @param plainTextPassword Plain text password to verify
   */
  public async verifyPassword(plainTextPassword: string): Promise<boolean> {
    return this.password.compare(plainTextPassword);
  }

  /**
   * Prepares the user for persistence by hashing the password if needed
   * This should be called before saving a new user to the database
   */
  public async prepareForPersistence(): Promise<void> {
    if (!this.password.isAlreadyHashed()) {
      this.password = await this.password.hash();
    }
  }

  /**
   * Sets the ID after the user has been persisted
   * This should only be called by repositories
   * @param id The ID from the database
   */
  public setId(id: number): void {
    if (this.id !== null) {
      throw new Error('Cannot change ID of an already persisted user');
    }
    this.id = id;
  }
}
