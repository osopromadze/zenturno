import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { testDatabaseConnection, disconnectDatabase } from './infra/db/prisma';
import { setupRoutes } from './infra/http/routes';
import { errorHandler } from './infra/http/middlewares/errorHandler';
import { logger } from './utils/logger';

import { setupSwagger } from './infra/http/swagger';

import { Server } from 'http';

// Initialize the Express application
const app = express();
let server: Server;

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

// Configure routes
setupRoutes(app);

// Error handling middleware (must be after routes)
app.use(errorHandler);




// Initialize database connection and start the server
testDatabaseConnection()
  .then((connected) => {
    if (connected) {
      // Start the server
      const PORT = process.env.PORT || 3001;
      server = app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
      });
    } else {
      logger.error('Could not start the server due to database issues');
      process.exit(1);
    }
  })
  .catch((error) => {
    logger.error(`Error initializing the application: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });

// Signal handling for graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Closing server...');
  server.close(() => {
    logger.info('HTTP server closed.');
    disconnectDatabase().then(() => {
      logger.info('Database connection closed.');
      process.exit(0);
    });
  });
});

export default app;