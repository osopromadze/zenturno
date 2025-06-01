import { PrismaClient } from '@prisma/client';
import { PinoLogger } from '../logging/PinoLogger';
import { PrismaUserRepository } from '../repositories/prisma/PrismaUserRepository';
import { RegisterUserUseCase } from '@domain/../application/user/RegisterUserUseCase';
import { UserController } from '@domain/../interfaces/http/controllers/UserController';
import { Logger } from '@domain/shared/Logger';
import { UserRepository } from '@domain/user/UserRepository';

/**
 * Dependency Injection Container
 * 
 * This container manages the creation and wiring of all application dependencies.
 * It follows the principles of Dependency Inversion and Inversion of Control.
 */
export class Container {
  private prismaClient: PrismaClient;
  private logger: Logger;
  private userRepository: UserRepository;
  private registerUserUseCase: RegisterUserUseCase;
  private userController: UserController;

  constructor() {
    // Initialize infrastructure dependencies
    this.prismaClient = new PrismaClient();
    this.logger = new PinoLogger();
    
    // Initialize repositories
    this.userRepository = new PrismaUserRepository(this.prismaClient, this.logger);
    
    // Initialize use cases
    this.registerUserUseCase = new RegisterUserUseCase(this.userRepository);
    
    // Initialize controllers
    this.userController = new UserController(this.registerUserUseCase);
  }

  /**
   * Gets the logger instance
   * @returns Logger instance
   */
  getLogger(): Logger {
    return this.logger;
  }

  /**
   * Gets the Prisma client instance
   * @returns PrismaClient instance
   */
  getPrismaClient(): PrismaClient {
    return this.prismaClient;
  }

  /**
   * Gets the user repository instance
   * @returns UserRepository instance
   */
  getUserRepository(): UserRepository {
    return this.userRepository;
  }

  /**
   * Gets the register user use case instance
   * @returns RegisterUserUseCase instance
   */
  getRegisterUserUseCase(): RegisterUserUseCase {
    return this.registerUserUseCase;
  }

  /**
   * Gets the user controller instance
   * @returns UserController instance
   */
  getUserController(): UserController {
    return this.userController;
  }

  /**
   * Gets all controllers
   * @returns Object containing all controllers
   */
  getControllers() {
    return {
      userController: this.userController,
      // Add other controllers here as needed
    };
  }

  /**
   * Closes all connections and resources
   */
  async close() {
    await this.prismaClient.$disconnect();
  }
}
