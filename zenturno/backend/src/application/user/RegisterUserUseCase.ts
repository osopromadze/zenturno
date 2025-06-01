import { User } from '../../domain/user/User';
import { Email } from '../../domain/user/Email';
import { Password } from '../../domain/user/Password';
import { UserRole } from '../../domain/user/UserRole';
import { UserRepository } from '../../domain/user/UserRepository';
import { RegisterUserDto } from './dto/RegisterUserDto';
import { UserResponseDto } from './dto/UserResponseDto';

/**
 * Application service for user registration
 * 
 * This class implements the use case for registering a new user in the system.
 * It coordinates domain objects and repositories to fulfill the business requirements.
 */
export class RegisterUserUseCase {
  private userRepository: UserRepository;

  /**
   * Constructor with dependency injection
   * @param userRepository Repository for user persistence operations
   */
  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Executes the user registration use case
   * @param registerUserDto Data for user registration
   * @returns The registered user data
   * @throws Error if registration fails (e.g., email already exists)
   */
  public async execute(registerUserDto: RegisterUserDto): Promise<UserResponseDto> {
    const { name, email, password, role } = registerUserDto;

    // Create domain value objects
    const emailVO = Email.create(email);
    const passwordVO = Password.create(password);
    
    // Check if email already exists
    const emailExists = await this.userRepository.existsByEmail(emailVO);
    if (emailExists) {
      throw new Error('Email already registered');
    }

    // Create user role (default to CLIENT if not provided)
    const userRole = role 
      ? UserRole.fromString(role) 
      : UserRole.getDefault();

    // Create user entity
    const user = User.create(name, emailVO, passwordVO, userRole);
    
    // Prepare user for persistence (hash password)
    await user.prepareForPersistence();
    
    // Save user to repository
    const savedUser = await this.userRepository.save(user);
    
    // Map domain entity to response DTO
    return this.mapToUserResponseDto(savedUser);
  }

  /**
   * Maps a User domain entity to a UserResponseDto
   * @param user The user entity to map
   * @returns User response DTO
   */
  private mapToUserResponseDto(user: User): UserResponseDto {
    return {
      id: user.getId() as number,
      name: user.getName(),
      email: user.getEmail().getValue(),
      role: user.getRole().getValue(),
      created_at: user.getCreatedAt().toISOString(),
      updated_at: user.getUpdatedAt().toISOString()
    };
  }
}
