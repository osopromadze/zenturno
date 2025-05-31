import { PrismaClient } from '@prisma/client';
import { logger } from '../../utils/logger';

// Create a singleton Prisma client instance
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Function to test the database connection
export const testDatabaseConnection = async (): Promise<boolean> => {
    try {
        await prisma.$connect();
        logger.info('Database connection has been established successfully.');
        return true;
    } catch (error) {
        logger.error(`Unable to connect to the database: ${error instanceof Error ? error.message : String(error)}`);
        return false;
    }
};

// Function to gracefully disconnect from the database
export const disconnectDatabase = async (): Promise<void> => {
    try {
        await prisma.$disconnect();
        logger.info('Database connection closed successfully.');
    } catch (error) {
        logger.error(`Error closing database connection: ${error instanceof Error ? error.message : String(error)}`);
    }
};
