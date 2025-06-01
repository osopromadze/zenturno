import 'dotenv/config';
import { Server } from 'http';
import { createApp } from './app';
import { testDatabaseConnection, disconnectDatabase } from './infra/db/prisma';
import { logger } from './utils/logger';

// Initialize the application using the Hexagonal Architecture
const { app, container } = createApp();
let server: Server;




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
    // Close the container resources (Prisma client)
    container.close().then(() => {
      logger.info('Container resources closed.');
      disconnectDatabase().then(() => {
        logger.info('Database connection closed.');
        process.exit(0);
      });
    });
  });
});

export default app;