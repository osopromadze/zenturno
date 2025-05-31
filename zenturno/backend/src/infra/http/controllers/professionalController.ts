import { Request, Response } from 'express';
import { ProfessionalRepository } from '../../repositories/prisma/ProfessionalRepository';
import { UserRepository } from '../../repositories/prisma/UserRepository';
import { logger } from '../../../utils/logger';

// Singleton instances of repositories
const professionalRepository = new ProfessionalRepository();
const userRepository = new UserRepository();

/**
 * Gets all professionals
 */
export const getAllProfessionals = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get all professionals
        const professionals = await professionalRepository.findAll();

        // Filter by specialty if provided
        const specialty = req.query.specialty as string | undefined;
        const filteredProfessionals = specialty
            ? await professionalRepository.findBySpecialty(specialty)
            : professionals;

        // Manual pagination
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedProfessionals = filteredProfessionals.slice(startIndex, endIndex);
        const total = filteredProfessionals.length;

        res.status(200).json({
            success: true,
            data: paginatedProfessionals,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        logger.error(`Error in getAllProfessionals: ${error instanceof Error ? error.message : String(error)}`);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Gets a professional by their ID
 */
export const getProfessionalById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            res.status(400).json({
                success: false,
                message: 'Invalid professional ID'
            });
            return;
        }

        const professional = await professionalRepository.findById(Number(id));

        if (!professional) {
            res.status(404).json({
                success: false,
                message: 'Profesional no encontrado'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: professional
        });
    } catch (error) {
        logger.error(`Error in getProfessionalById: ${error instanceof Error ? error.message : String(error)}`);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Gets the availability of a professional
 */
export const getProfessionalAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { date, service_id } = req.query;

        if (!id || isNaN(Number(id))) {
            res.status(400).json({
                success: false,
                message: 'Invalid professional ID'
            });
            return;
        }

        if (!date) {
            res.status(400).json({
                success: false,
                message: 'Date is required'
            });
            return;
        }

        if (!service_id || isNaN(Number(service_id))) {
            res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            });
            return;
        }

        // Verify that the professional exists
        const professional = await professionalRepository.findById(Number(id));

        if (!professional) {
            res.status(404).json({
                success: false,
                message: 'Profesional no encontrado'
            });
            return;
        }

        // Obtener disponibilidad
        const availability = await professionalRepository.getAvailability(
            Number(id),
            new Date(date as string)
        );

        res.status(200).json({
            success: true,
            data: availability
        });
    } catch (error) {
        logger.error(`Error in getProfessionalAvailability: ${error instanceof Error ? error.message : String(error)}`);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Crea un nuevo profesional (solo admin)
 */
export const createProfessional = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, specialty, user_id } = req.body;

        // Validate input data
        if (!name || !user_id) {
            res.status(400).json({
                success: false,
                message: 'Name and user ID are required'
            });
            return;
        }

        // Verify that the user exists
        const user = await userRepository.findById(user_id);

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        // Verify that the user is not already associated with a professional
        const existingProfessional = await professionalRepository.findByUserId(user_id);

        if (existingProfessional) {
            res.status(409).json({
                success: false,
                message: 'User is already associated with a professional'
            });
            return;
        }

        // Crear profesional
        const newProfessional = await professionalRepository.create({
            name,
            specialty,
            user_id
        });

        // Update user role to 'professional' if not already
        if (user.role !== 'professional') {
            await userRepository.update(user_id, { role: 'professional' });
        }

        res.status(201).json({
            success: true,
            data: newProfessional,
            message: 'Professional created successfully'
        });
    } catch (error) {
        logger.error(`Error en createProfessional: ${error instanceof Error ? error.message : String(error)}`);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Actualiza un profesional (solo admin)
 */
export const updateProfessional = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, specialty } = req.body;

        // Validar ID
        if (!id || isNaN(Number(id))) {
            res.status(400).json({
                success: false,
                message: 'Invalid professional ID'
            });
            return;
        }

        // Validar datos
        if (!name && !specialty) {
            res.status(400).json({
                success: false,
                message: 'No data provided for update'
            });
            return;
        }

        // Verify that the professional exists
        const professional = await professionalRepository.findById(Number(id));

        if (!professional) {
            res.status(404).json({
                success: false,
                message: 'Profesional no encontrado'
            });
            return;
        }

        // Update professional
        const updatedProfessional = await professionalRepository.update(Number(id), {
            name,
            specialty
        });

        res.status(200).json({
            success: true,
            data: updatedProfessional,
            message: 'Professional updated successfully'
        });
    } catch (error) {
        logger.error(`Error en updateProfessional: ${error instanceof Error ? error.message : String(error)}`);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
