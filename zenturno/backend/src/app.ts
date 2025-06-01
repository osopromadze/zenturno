import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { Container } from './infrastructure/config/container';
import { createRouter } from './interfaces/http/routes';
import { errorHandler } from '@infra/http/middlewares/errorHandler';
import { setupSwagger } from '@infra/http/swagger';

/**
 * Creates and configures an Express application
 * @returns Configured Express application
 */
export const createApp = (): { app: Application; container: Container } => {
  // Initialize the dependency injection container
  const container = new Container();
  const logger = container.getLogger();

  // Initialize the Express application
  const app = express();

  // Basic Middlewares
  app.use(cors());
  app.use(helmet());
  app.use(express.json());
  app.use(morgan('combined'));

  // Rate limit configuration to prevent DoS attacks
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit of 100 requests per time window per IP
  });
  app.use(limiter);

  // Swagger configuration
  setupSwagger(app);

  // Configure routes using the controllers from the container
  const router = createRouter(container.getControllers());
  app.use('/api', router);

  // Error handling middleware (must be after routes)
  app.use(errorHandler);

  logger.info('Application configured successfully');

  return { app, container };
};
