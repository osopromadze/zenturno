import { Router } from 'express';
import { UserController } from '../controllers/UserController';

/**
 * Creates and configures routes for user-related endpoints
 * @param userController Controller for handling user requests
 * @returns Express router configured with user routes
 */
export const userRoutes = (userController: UserController): Router => {
  const router = Router();
  
  /**
   * POST /api/users/register
   * Registers a new user
   * @body {name, email, password, role?}
   * @returns Newly created user data
   */
  router.post('/register', (req, res) => userController.register(req, res));
  
  // Additional user routes would be added here
  
  return router;
};
