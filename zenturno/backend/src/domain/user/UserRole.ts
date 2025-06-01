/**
 * UserRole Value Object
 * 
 * Represents the possible roles a user can have in the system.
 * As a Value Object, it's immutable and identified by its value rather than an identity.
 */
export class UserRole {
  // Define all possible roles as static constants
  public static readonly ADMIN = new UserRole('ADMIN');
  public static readonly PROFESSIONAL = new UserRole('PROFESSIONAL');
  public static readonly CLIENT = new UserRole('CLIENT');
  
  private readonly value: string;

  private constructor(role: string) {
    this.value = role;
  }

  /**
   * Creates a UserRole from a string value, validating that it's a valid role
   * @param role The role string
   * @throws Error if the role is invalid
   */
  public static fromString(role: string): UserRole {
    const normalizedRole = role.toUpperCase();
    
    switch (normalizedRole) {
      case 'ADMIN':
        return UserRole.ADMIN;
      case 'PROFESSIONAL':
        return UserRole.PROFESSIONAL;
      case 'CLIENT':
        return UserRole.CLIENT;
      default:
        throw new Error(`Invalid role: ${role}`);
    }
  }

  /**
   * Returns the default role for new users
   */
  public static getDefault(): UserRole {
    return UserRole.CLIENT;
  }

  /**
   * Returns the string value of the role
   */
  public getValue(): string {
    return this.value;
  }

  /**
   * Compares this role with another role
   * @param other The other role to compare with
   */
  public equals(other: UserRole): boolean {
    return this.value === other.getValue();
  }

  /**
   * Checks if this role is an admin role
   */
  public isAdmin(): boolean {
    return this.equals(UserRole.ADMIN);
  }

  /**
   * Checks if this role is a professional role
   */
  public isProfessional(): boolean {
    return this.equals(UserRole.PROFESSIONAL);
  }

  /**
   * Checks if this role is a client role
   */
  public isClient(): boolean {
    return this.equals(UserRole.CLIENT);
  }
}
