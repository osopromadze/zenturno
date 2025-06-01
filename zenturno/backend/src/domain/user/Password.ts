import * as bcrypt from 'bcrypt';

/**
 * Password Value Object
 * 
 * Encapsulates the rules, validation, and hashing for passwords in the system.
 * As a Value Object, it's immutable and identified by its value rather than an identity.
 */
export class Password {
  private readonly value: string;
  private readonly isHashed: boolean;

  private constructor(password: string, isHashed: boolean) {
    this.value = password;
    this.isHashed = isHashed;
  }

  /**
   * Creates a new Password value object after validating the input
   * @param password The plain text password to validate
   * @throws Error if the password is invalid
   */
  public static create(password: string): Password {
    if (!password) {
      throw new Error('Password cannot be empty');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Additional password strength validation could be added here
    
    return new Password(password, false);
  }

  /**
   * Creates a Password object from an already hashed password
   * @param hashedPassword The hashed password from the database
   */
  public static fromHashed(hashedPassword: string): Password {
    if (!hashedPassword) {
      throw new Error('Hashed password cannot be empty');
    }
    
    return new Password(hashedPassword, true);
  }

  /**
   * Returns the value of the password
   * Note: This should be used carefully to avoid exposing plain text passwords
   */
  public getValue(): string {
    return this.value;
  }

  /**
   * Checks if the password is already hashed
   */
  public isAlreadyHashed(): boolean {
    return this.isHashed;
  }

  /**
   * Hashes the password if it's not already hashed
   * @returns A new Password object with the hashed value
   */
  public async hash(): Promise<Password> {
    if (this.isHashed) {
      return this;
    }
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(this.value, saltRounds);
    return new Password(hashedPassword, true);
  }

  /**
   * Compares a plain text password with this password
   * @param plainTextPassword The plain text password to compare
   */
  public async compare(plainTextPassword: string): Promise<boolean> {
    if (!this.isHashed) {
      return this.value === plainTextPassword;
    }
    
    return bcrypt.compare(plainTextPassword, this.value);
  }
}
