import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { RegisterUserUseCase } from '../../../src/application/user/RegisterUserUseCase';
import { InMemoryUserRepository } from '../../../src/infrastructure/repositories/memory/InMemoryUserRepository';
import { Email } from '../../../src/domain/user/Email';
import { RegisterUserDto } from '../../../src/application/user/dto/RegisterUserDto';
import { UserResponseDto } from '../../../src/application/user/dto/UserResponseDto';

describe('RegisterUserUseCase', () => {
  let userRepository: InMemoryUserRepository;
  let registerUserUseCase: RegisterUserUseCase;
  
  beforeEach(() => {
    // Create a fresh repository for each test
    userRepository = new InMemoryUserRepository();
    registerUserUseCase = new RegisterUserUseCase(userRepository);
  });
  
  afterEach(() => {
    // Clear the repository after each test
    userRepository.clear();
  });
  
  it('should register a new user successfully', async () => {
    // Arrange
    const registerUserDto: RegisterUserDto = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'Password123!'
    };
    
    // Act
    const result = await registerUserUseCase.execute(registerUserDto);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.name).toBe(registerUserDto.name);
    expect(result.email).toBe(registerUserDto.email);
    expect(result.role).toBe('CLIENT'); // Default role is uppercase
    
    // Ensure password is not returned
    expect((result as any).password).toBeUndefined();
    
    // Verify user was saved in repository
    const email = Email.create(registerUserDto.email);
    const savedUser = await userRepository.findByEmail(email);
    expect(savedUser).not.toBeNull();
    expect(savedUser?.getName()).toBe(registerUserDto.name);
  });
  
  it('should register a user with a specific role when provided', async () => {
    // Arrange
    const registerUserDto: RegisterUserDto = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Password123!',
      role: 'admin'
    };
    
    // Act
    const result = await registerUserUseCase.execute(registerUserDto);
    
    // Assert
    expect(result.role).toBe('ADMIN'); // Roles are stored uppercase
    
    // Verify user was saved with correct role
    const email = Email.create(registerUserDto.email);
    const savedUser = await userRepository.findByEmail(email);
    expect(savedUser?.getRole().getValue()).toBe('ADMIN'); // Roles are stored uppercase
  });
  
  it('should throw an error if email is already registered', async () => {
    // Arrange
    const registerUserDto: RegisterUserDto = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'Password123!'
    };
    
    // Register the user first
    await registerUserUseCase.execute(registerUserDto);
    
    // Act & Assert
    await expect(registerUserUseCase.execute(registerUserDto))
      .rejects
      .toThrow('Email already registered');
  });
  
  it('should throw an error if email is invalid', async () => {
    // Arrange
    const registerUserDto: RegisterUserDto = {
      name: 'John Doe',
      email: 'invalid-email',
      password: 'Password123!'
    };
    
    // Act & Assert
    await expect(registerUserUseCase.execute(registerUserDto))
      .rejects
      .toThrow('Invalid email format');
  });
  
  it('should throw an error if password is too weak', async () => {
    // Arrange
    const registerUserDto: RegisterUserDto = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'weak'
    };
    
    // Act & Assert
    await expect(registerUserUseCase.execute(registerUserDto))
      .rejects
      .toThrow('Password must be at least 8 characters');
  });
  
  it('should throw an error if name is empty', async () => {
    // Arrange
    const registerUserDto: RegisterUserDto = {
      name: '',
      email: 'john.doe@example.com',
      password: 'Password123!'
    };
    
    // Act & Assert
    await expect(registerUserUseCase.execute(registerUserDto))
      .rejects
      .toThrow('Name cannot be empty');
  });
});
