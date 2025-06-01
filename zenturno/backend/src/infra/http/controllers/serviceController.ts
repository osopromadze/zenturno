import { Request, Response } from 'express';
import { logger } from '../../../utils/logger';
import { ServiceRepository } from '../../repositories/prisma/ServiceRepository';

// Singleton instance of ServiceRepository
const serviceRepository = new ServiceRepository();

/**
 * Gets all services
 */
export const getAllServices = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get all services
        const services = await serviceRepository.findAll();

        // Manual pagination
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedServices = services.slice(startIndex, endIndex);
        const total = services.length;

        res.status(200).json({
            success: true,
            data: paginatedServices,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        logger.error(`Error in getAllServices: ${error instanceof Error ? error.message : String(error)}`);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Gets a service by its ID
 */
export const getServiceById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            });
            return;
        }

        const service = await serviceRepository.findById(Number(id));

        if (!service) {
            res.status(404).json({
                success: false,
                message: 'Service not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: service
        });
    } catch (error) {
        logger.error(`Error in getServiceById: ${error instanceof Error ? error.message : String(error)}`);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Creates a new service (admin only)
 */
export const createService = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, price, duration_minutes } = req.body;

        // Validate input data
        if (!name || !price || !duration_minutes) {
            res.status(400).json({
                success: false,
                message: 'Name, price, and duration are required'
            });
            return;
        }

        // Validate data format
        if (isNaN(Number(price)) || Number(price) <= 0) {
            res.status(400).json({
                success: false,
                message: 'Price must be a positive number'
            });
            return;
        }

        if (isNaN(Number(duration_minutes)) || Number(duration_minutes) <= 0) {
            res.status(400).json({
                success: false,
                message: 'Duration must be a positive number'
            });
            return;
        }

        // Check if a service with the same name already exists
        const existingServices = await serviceRepository.findByName(name);
        const existingService = existingServices.length > 0 ? existingServices[0] : null;

        if (existingService) {
            res.status(409).json({
                success: false,
                message: 'A service with this name already exists'
            });
            return;
        }

        // Create service
        const newService = await serviceRepository.create({
            name,
            price: Number(price),
            duration_minutes: Number(duration_minutes)
        });

        res.status(201).json({
            success: true,
            data: newService,
            message: 'Service created successfully'
        });
    } catch (error) {
        logger.error(`Error in createService: ${error instanceof Error ? error.message : String(error)}`);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Updates a service (admin only)
 */
export const updateService = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, price, duration_minutes } = req.body;

        // Validate ID
        if (!id || isNaN(Number(id))) {
            res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            });
            return;
        }

        // Validate input data
        if (!name && !price && !duration_minutes) {
            res.status(400).json({
                success: false,
                message: 'No data provided for update'
            });
            return;
        }

        // Validate data format
        if (price !== undefined && (isNaN(Number(price)) || Number(price) <= 0)) {
            res.status(400).json({
                success: false,
                message: 'Price must be a positive number'
            });
            return;
        }

        if (duration_minutes !== undefined && (isNaN(Number(duration_minutes)) || Number(duration_minutes) <= 0)) {
            res.status(400).json({
                success: false,
                message: 'Duration must be a positive number'
            });
            return;
        }

        // Check if the service exists
        const service = await serviceRepository.findById(Number(id));

        if (!service) {
            res.status(404).json({
                success: false,
                message: 'Service not found'
            });
            return;
        }

        // If the name is being updated, check if it already exists
        if (name && name !== service.name) {
            const existingServices = await serviceRepository.findByName(name);
            const existingService = existingServices.length > 0 ? existingServices[0] : null;

            if (existingService && existingService.id !== Number(id)) {
                res.status(409).json({
                    success: false,
                    message: 'A service with this name already exists'
                });
                return;
            }
        }

        // Preparar datos para actualizar
        const updateData: any = {};

        if (name) updateData.name = name;
        if (price !== undefined) updateData.price = Number(price);
        if (duration_minutes !== undefined) updateData.duration_minutes = Number(duration_minutes);

        // Actualizar servicio
        const updatedService = await serviceRepository.update(Number(id), updateData);

        res.status(200).json({
            success: true,
            data: updatedService,
            message: 'Service updated successfully'
        });
    } catch (error) {
        logger.error(`Error en updateService: ${error instanceof Error ? error.message : String(error)}`);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
