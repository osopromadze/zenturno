/**
 * Email Value Object
 * 
 * Encapsulates the rules and validation for email addresses in the system.
 * As a Value Object, it's immutable and identified by its value rather than an identity.
 */
export class Email {
  private readonly value: string;

  private constructor(email: string) {
    this.value = email;
  }

  /**
   * Creates a new Email value object after validating the input
   * @param email The email string to validate
   * @throws Error if the email is invalid
   */
  public static create(email: string): Email {
    if (!email) {
      throw new Error('Email cannot be empty');
    }

    // Simple regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    return new Email(email);
  }

  /**
   * Returns the string value of the email
   */
  public getValue(): string {
    return this.value;
  }

  /**
   * Compares this email with another email value object
   * @param other The other email to compare with
   */
  public equals(other: Email): boolean {
    return this.value.toLowerCase() === other.getValue().toLowerCase();
  }
}
