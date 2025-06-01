import { Request, Response } from 'express';
import { AppointmentRepository } from '../../repositories/prisma/AppointmentRepository';
import { ClientRepository } from '../../repositories/prisma/ClientRepository';
import { ProfessionalRepository } from '../../repositories/prisma/ProfessionalRepository';
import { ServiceRepository } from '../../repositories/prisma/ServiceRepository';
import { logger } from '../../../utils/logger';
import { prisma } from '../../db/prisma';

// Singleton instances of repositories with proper dependencies
const appointmentRepository = new AppointmentRepository(prisma, logger);
const clientRepository = new ClientRepository();
const professionalRepository = new ProfessionalRepository();
const serviceRepository = new ServiceRepository();

/**
 * Crea una nueva cita
 */
export const createAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { datetime, professional_id, service_id } = req.body;
        const userId = req.user?.id;

        // Validar datos de entrada
        if (!datetime || !professional_id || !service_id) {
            res.status(400).json({
                success: false,
                message: 'Datetime, professional and service are required'
            });
            return;
        }

        // Verificar que el usuario esté autenticado
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }

        // Obtener el cliente asociado al usuario
        const client = await clientRepository.findByUserId(userId);
        if (!client) {
            res.status(404).json({
                success: false,
                message: 'Client not found for this user'
            });
            return;
        }

        // Verificar que el profesional exista
        const professional = await professionalRepository.findById(professional_id);
        if (!professional) {
            res.status(404).json({
                success: false,
                message: 'Professional not found'
            });
            return;
        }

        // Verificar que el servicio exista
        const service = await serviceRepository.findById(service_id);
        if (!service) {
            res.status(404).json({
                success: false,
                message: 'Service not found'
            });
            return;
        }

        // Check professional's availability
        const availability = await professionalRepository.getAvailability(professional_id, new Date(datetime));
        const isAvailable = availability.length > 0;

        if (!isAvailable) {
            res.status(409).json({
                success: false,
                message: 'The professional is not available at this time'
            });
            return;
        }

        // Crear la cita
        const newAppointment = await appointmentRepository.create({
            datetime: new Date(datetime),
            client_id: client.id,
            professional_id,
            service_id,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            data: newAppointment,
            message: 'Appointment created successfully'
        });
    } catch (error) {
        logger.error(`Error en createAppointment: ${error instanceof Error ? error.message : String(error)}`);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Obtiene las citas del usuario autenticado
 */
export const getMyAppointments = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { status } = req.query;

        // Verificar que el usuario esté autenticado
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }

        // Get user role
        const userRole = req.user?.rol;

        // Get appointments based on role
        let appointments;

        if (userRole === 'CLIENT') {
            const client = await clientRepository.findByUserId(userId);

            if (!client) {
                res.status(404).json({
                    success: false,
                    message: 'Client not found for this user'
                });
                return;
            }

            appointments = await appointmentRepository.findByClientId(client.id);

            // Filter by status if specified
            if (status) {
                appointments = appointments.filter(appointment => appointment.status === status);
            }
        } else if (userRole === 'PROFESSIONAL') {
            const professional = await professionalRepository.findByUserId(userId);

            if (!professional) {
                res.status(404).json({
                    success: false,
                    message: 'Professional not found for this user'
                });
                return;
            }

            appointments = await appointmentRepository.findByProfessionalId(professional.id);

            // Filter by status if specified
            if (status) {
                appointments = appointments.filter(appointment => appointment.status === status);
            }
        } else if (userRole === 'admin') {
            appointments = await appointmentRepository.findAll();

            // Filter by status if specified
            if (status) {
                appointments = appointments.filter(appointment => appointment.status === status);
            }
        } else {
            res.status(403).json({
                success: false,
                message: 'Unauthorized role'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: appointments
        });
    } catch (error) {
        logger.error(`Error en getMyAppointments: ${error instanceof Error ? error.message : String(error)}`);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Obtiene una cita por su ID
 */
export const getAppointmentById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        // Verificar que el usuario esté autenticado
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }

        // Validar ID
        if (!id || isNaN(Number(id))) {
            res.status(400).json({
                success: false,
                message: 'Invalid appointment ID'
            });
            return;
        }

        // Obtener la cita
        const appointment = await appointmentRepository.findById(Number(id));

        if (!appointment) {
            res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
            return;
        }

        // Check permissions (only admin, client or professional can view the appointment)
        const userRole = req.user?.rol;

        if (userRole !== 'ADMIN') {
            let hasPermission = false;

            if (userRole === 'CLIENT') {
                const client = await clientRepository.findByUserId(userId);
                hasPermission = client?.id === appointment.client_id;
            } else if (userRole === 'PROFESSIONAL') {
                const professional = await professionalRepository.findByUserId(userId);
                hasPermission = professional?.id === appointment.professional_id;
            }

            if (!hasPermission) {
                res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver esta cita'
                });
                return;
            }
        }

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        logger.error(`Error en getAppointmentById: ${error instanceof Error ? error.message : String(error)}`);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Cancela una cita
 */
export const cancelAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        // Verificar que el usuario esté autenticado
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }

        // Validar ID
        if (!id || isNaN(Number(id))) {
            res.status(400).json({
                success: false,
                message: 'Invalid appointment ID'
            });
            return;
        }

        // Obtener la cita
        const appointment = await appointmentRepository.findById(Number(id));

        if (!appointment) {
            res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
            return;
        }

        // Verificar que la cita no esté ya cancelada
        if (appointment.status === 'cancelled') {
            res.status(400).json({
                success: false,
                message: 'The appointment is already cancelled'
            });
            return;
        }

        // Check permissions (only admin, client or professional can cancel the appointment)
        const userRole = req.user?.rol;

        if (userRole !== 'ADMIN') {
            let hasPermission = false;

            if (userRole === 'CLIENT') {
                const client = await clientRepository.findByUserId(userId);
                hasPermission = client?.id === appointment.client_id;
            } else if (userRole === 'PROFESSIONAL') {
                const professional = await professionalRepository.findByUserId(userId);
                hasPermission = professional?.id === appointment.professional_id;
            }

            if (!hasPermission) {
                res.status(403).json({
                    success: false,
                    message: 'You do not have permission to cancel this appointment'
                });
                return;
            }
        }

        // Cancelar la cita
        const updatedAppointment = await appointmentRepository.update(Number(id), {
            status: 'cancelled'
        });

        res.status(200).json({
            success: true,
            data: updatedAppointment,
            message: 'Appointment cancelled successfully'
        });
    } catch (error) {
        logger.error(`Error en cancelAppointment: ${error instanceof Error ? error.message : String(error)}`);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Obtiene todas las citas (solo admin y profesionales)
 */
export const getAllAppointments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status, start_date, end_date, page = '1', limit = '10' } = req.query;

        // Parámetros de paginación
        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        // Filtros
        const filters: any = {};

        if (status) {
            filters.status = status as string;
        }

        if (start_date && end_date) {
            filters.dateRange = {
                start: new Date(start_date as string),
                end: new Date(end_date as string)
            };
        }

        // Get appointments
        const appointments = await appointmentRepository.findAll();
        
        // Apply filters
        let filteredAppointments = appointments;
        if (filters.status) {
            filteredAppointments = filteredAppointments.filter(a => a.status === filters.status);
        }
        if (filters.dateRange) {
            filteredAppointments = filteredAppointments.filter(a => {
                const appointmentDate = new Date(a.datetime);
                return appointmentDate >= filters.dateRange.start && appointmentDate <= filters.dateRange.end;
            });
        }

        // Apply pagination
        const total = filteredAppointments.length;
        const startIndex = (pageNumber - 1) * limitNumber;
        const endIndex = startIndex + limitNumber;
        const paginatedAppointments = filteredAppointments.slice(startIndex, endIndex);

        res.status(200).json({
            success: true,
            data: paginatedAppointments,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                pages: Math.ceil(total / limitNumber)
            }
        });
    } catch (error) {
        logger.error(`Error en getAllAppointments: ${error instanceof Error ? error.message : String(error)}`);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
