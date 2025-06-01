import { Router } from 'express';
import { userRoutes } from './userRoutes';
import { UserController } from '../controllers/UserController';

/**
 * Creates and configures the main application router
 * @param controllers Object containing all controllers
 * @returns Express router configured with all application routes
 */
export const createRouter = (controllers: {
  userController: UserController;
  // Add other controllers here as needed
}): Router => {
  const router = Router();
  
  // Mount user routes
  router.use('/users', userRoutes(controllers.userController));
  
  // Additional route modules would be mounted here
  // Example: router.use('/appointments', appointmentRoutes(controllers.appointmentController));
  
  return router;
};
