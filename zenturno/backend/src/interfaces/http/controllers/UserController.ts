import { Request, Response } from 'express';
import { RegisterUserUseCase } from '@domain/../application/user/RegisterUserUseCase';
import { RegisterUserDto } from '@domain/../application/user/dto/RegisterUserDto';

/**
 * HTTP Controller for user-related endpoints
 * 
 * This is an adapter in the Hexagonal Architecture that handles
 * HTTP requests and responses for user operations.
 */
export class UserController {
  private registerUserUseCase: RegisterUserUseCase;

  /**
   * Constructor with dependency injection
   * @param registerUserUseCase Use case for user registration
   */
  constructor(registerUserUseCase: RegisterUserUseCase) {
    this.registerUserUseCase = registerUserUseCase;
  }

  /**
   * Handles user registration HTTP requests
   * @param req Express request object
   * @param res Express response object
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { name, email, password, role } = req.body;
      
      if (!name || !email || !password) {
        res.status(400).json({
          success: false,
          message: 'Name, email, and password are required'
        });
        return;
      }
      
      // Create DTO from request body
      const registerUserDto: RegisterUserDto = {
        name,
        email,
        password,
        role
      };
      
      // Execute the use case
      const user = await this.registerUserUseCase.execute(registerUserDto);
      
      // Return success response
      res.status(201).json({
        success: true,
        data: user,
        message: 'User registered successfully'
      });
    } catch (error) {
      // Handle specific errors
      if (error instanceof Error) {
        if (error.message === 'Email already registered') {
          res.status(409).json({
            success: false,
            message: error.message
          });
          return;
        }
        
        if (error.message.includes('Invalid email') || 
            error.message.includes('Password must be')) {
          res.status(400).json({
            success: false,
            message: error.message
          });
          return;
        }
      }
      
      // Handle unexpected errors
      console.error('Error registering user:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
