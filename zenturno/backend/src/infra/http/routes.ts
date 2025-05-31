import { Express, Router } from 'express';
import { logger } from '../../utils/logger';

// Importar controladores
import * as authController from './controllers/authController';
import * as userController from './controllers/userController';
import * as appointmentController from './controllers/appointmentController';
import * as professionalController from './controllers/professionalController';
import * as serviceController from './controllers/serviceController';

// Importar middlewares
import { authenticate } from './middlewares/authenticate';
import { authorize } from './middlewares/authorize';

/**
 * Configures all application routes
 * @param app Express Application
 */
export const setupRoutes = (app: Express): void => {
  const apiRouter = Router();

  // Middleware for all /api routes
  apiRouter.use((req, res, next) => {
    logger.debug(`${req.method} ${req.originalUrl}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    next();
  });

  // Authentication routes (public)
  const authRouter = Router();
  authRouter.post('/login', authController.login);
  authRouter.post('/register', authController.register);
  authRouter.post('/forgot-password', authController.forgotPassword);
  authRouter.post('/reset-password', authController.resetPassword);
  apiRouter.use('/auth', authRouter);

  // User routes (protected)
  const userRouter = Router();
  userRouter.get('/me', authenticate, userController.getProfile);
  userRouter.put('/me', authenticate, userController.updateProfile);
  userRouter.get('/:id', authenticate, authorize(['admin']), userController.getUserById);
  userRouter.get('/', authenticate, authorize(['admin']), userController.getAllUsers);
  apiRouter.use('/users', userRouter);

  // Rutas de citas
  const appointmentRouter = Router();
  appointmentRouter.post('/', authenticate, appointmentController.createAppointment);
  appointmentRouter.get('/my', authenticate, appointmentController.getMyAppointments);
  appointmentRouter.get('/:id', authenticate, appointmentController.getAppointmentById);
  appointmentRouter.put('/:id/cancel', authenticate, appointmentController.cancelAppointment);
  appointmentRouter.get('/', authenticate, authorize(['admin', 'professional']), appointmentController.getAllAppointments);
  apiRouter.use('/appointments', appointmentRouter);

  // Professional routes
  const professionalRouter = Router();
  professionalRouter.get('/', professionalController.getAllProfessionals);
  professionalRouter.get('/:id', professionalController.getProfessionalById);
  professionalRouter.get('/:id/availability', professionalController.getProfessionalAvailability);
  professionalRouter.post('/', authenticate, authorize(['admin']), professionalController.createProfessional);
  professionalRouter.put('/:id', authenticate, authorize(['admin']), professionalController.updateProfessional);
  apiRouter.use('/professionals', professionalRouter);

  // Service routes
  const serviceRouter = Router();
  serviceRouter.get('/', serviceController.getAllServices);
  serviceRouter.get('/:id', serviceController.getServiceById);
  serviceRouter.post('/', authenticate, authorize(['admin']), serviceController.createService);
  serviceRouter.put('/:id', authenticate, authorize(['admin']), serviceController.updateService);
  apiRouter.use('/services', serviceRouter);

  // Mount all routes under /api
  app.use('/api', apiRouter);

  // Ruta para healthcheck
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Handling of not found routes
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `Ruta no encontrada: ${req.originalUrl}`
    });
  });
}; 