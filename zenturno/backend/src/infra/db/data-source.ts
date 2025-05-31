import { DataSource } from 'typeorm';
import config from '../../config/config';
import { join } from 'path';
import { logger } from '../../utils/logger';

// Entities
// Import your entities here
// import { User } from '../entities/User';
// import { Professional } from '../entities/Professional';
// import { Client } from '../entities/Client';
// import { Service } from '../entities/Service';
// import { Appointment } from '../entities/Appointment';

// Crea una instancia de DataSource
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: config.env === 'development', // Solo activar en desarrollo
  logging: config.database.logging,
  entities: [join(__dirname, '../../domain/entities/**/*.{ts,js}')],
  migrations: [join(__dirname, '../migrations/**/*.{ts,js}')],
  subscribers: [join(__dirname, '../../domain/subscribers/**/*.{ts,js}')],
  // Additional connection options
  // SSL for production environments if necessary
  ...(config.env === 'production' && {
    ssl: {
      rejectUnauthorized: false
    }
  })
});

// Function to test the database connection
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    await AppDataSource.initialize();
    logger.info('Database connection has been established successfully.');
    await AppDataSource.destroy();
    return true;
  } catch (error) {
    logger.error(`Unable to connect to the database: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}; 