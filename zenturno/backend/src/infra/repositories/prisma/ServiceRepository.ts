import { prisma } from '../../db/prisma';
import { Service } from '@prisma/client';
import { logger } from '../../../utils/logger';

export interface CreateServiceInput {
    name: string;
    price: number;
    duration_minutes: number;
}

export interface UpdateServiceInput {
    name?: string;
    price?: number;
    duration_minutes?: number;
}

export interface ServiceFilter {
    minPrice?: number;
    maxPrice?: number;
    minDuration?: number;
    maxDuration?: number;
}

export class ServiceRepository {
    /**
     * Find a service by ID
     */
    async findById(id: number): Promise<Service | null> {
        try {
            return await prisma.service.findUnique({
                where: { id },
                include: {
                    appointments: true
                }
            });
        } catch (error) {
            logger.error(`Error finding service by ID: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Create a new service
     */
    async create(data: CreateServiceInput): Promise<Service> {
        try {
            return await prisma.service.create({
                data: {
                    name: data.name,
                    price: data.price,
                    duration_minutes: data.duration_minutes
                }
            });
        } catch (error) {
            logger.error(`Error creating service: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Update an existing service
     */
    async update(id: number, data: UpdateServiceInput): Promise<Service> {
        try {
            return await prisma.service.update({
                where: { id },
                data
            });
        } catch (error) {
            logger.error(`Error updating service: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Delete a service
     */
    async delete(id: number): Promise<Service> {
        try {
            return await prisma.service.delete({
                where: { id }
            });
        } catch (error) {
            logger.error(`Error deleting service: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Find all services
     */
    async findAll(): Promise<Service[]> {
        try {
            return await prisma.service.findMany({
                orderBy: {
                    name: 'asc'
                }
            });
        } catch (error) {
            logger.error(`Error finding all services: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Find services by name (partial match)
     */
    async findByName(name: string): Promise<Service[]> {
        try {
            return await prisma.service.findMany({
                where: {
                    name: {
                        contains: name,
                        mode: 'insensitive'
                    }
                },
                orderBy: {
                    name: 'asc'
                }
            });
        } catch (error) {
            logger.error(`Error finding services by name: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Find services by price range
     */
    async findByPriceRange(minPrice: number, maxPrice: number): Promise<Service[]> {
        try {
            return await prisma.service.findMany({
                where: {
                    price: {
                        gte: minPrice,
                        lte: maxPrice
                    }
                },
                orderBy: {
                    price: 'asc'
                }
            });
        } catch (error) {
            logger.error(`Error finding services by price range: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Find services by duration range
     */
    async findByDurationRange(minDuration: number, maxDuration: number): Promise<Service[]> {
        try {
            return await prisma.service.findMany({
                where: {
                    duration_minutes: {
                        gte: minDuration,
                        lte: maxDuration
                    }
                },
                orderBy: {
                    duration_minutes: 'asc'
                }
            });
        } catch (error) {
            logger.error(`Error finding services by duration range: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Find services with filters
     */
    async findWithFilters(filters: ServiceFilter): Promise<Service[]> {
        try {
            const where: any = {};

            if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
                where.price = {};
                if (filters.minPrice !== undefined) {
                    where.price.gte = filters.minPrice;
                }
                if (filters.maxPrice !== undefined) {
                    where.price.lte = filters.maxPrice;
                }
            }

            if (filters.minDuration !== undefined || filters.maxDuration !== undefined) {
                where.duration_minutes = {};
                if (filters.minDuration !== undefined) {
                    where.duration_minutes.gte = filters.minDuration;
                }
                if (filters.maxDuration !== undefined) {
                    where.duration_minutes.lte = filters.maxDuration;
                }
            }

            return await prisma.service.findMany({
                where,
                orderBy: [
                    { price: 'asc' },
                    { name: 'asc' }
                ]
            });
        } catch (error) {
            logger.error(`Error finding services with filters: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
}
