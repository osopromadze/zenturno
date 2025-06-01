import { PrismaClient } from '@prisma/client';
import { prisma } from '../../db/prisma'; // Keep for now, but will be removed if constructor injection is fully adopted
import { logger } from '../../../utils/logger';
import { Appointment } from '@prisma/client';

export interface CreateAppointmentInput {
    datetime: Date;
    client_id: number;
    professional_id: number;
    service_id: number;
    status?: string;
}

export interface UpdateAppointmentInput {
    datetime?: Date;
    client_id?: number;
    professional_id?: number;
    service_id?: number;
    status?: string;
}

export interface AppointmentFilter {
    clientId?: number;
    professionalId?: number;
    serviceId?: number;
    status?: string;
    startDate?: Date;
    endDate?: Date;
}

export class AppointmentRepository {
    private prisma: PrismaClient;
    private logger: typeof logger;

    constructor(prismaClient: PrismaClient, loggerInstance: typeof logger) {
        this.prisma = prismaClient;
        this.logger = loggerInstance;
    }
    /**
     * Find an appointment by ID
     */
    async findById(id: number): Promise<Appointment | null> {
        try {
            return await this.prisma.appointment.findUnique({
                where: { id },
                include: {
                    client: true,
                    professional: true,
                    service: true
                }
            });
        } catch (error) {
            this.logger.error(`Error finding appointment by ID: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Create a new appointment
     */
    async create(data: CreateAppointmentInput): Promise<Appointment> {
        try {
            return await this.prisma.appointment.create({
                data,
                include: {
                    client: true,
                    professional: true,
                    service: true
                }
            });
        } catch (error) {
            this.logger.error(`Error creating appointment: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Update an existing appointment
     */
    async update(id: number, data: UpdateAppointmentInput): Promise<Appointment> {
        try {
            return await this.prisma.appointment.update({
                where: { id },
                data,
                include: {
                    client: true,
                    professional: true,
                    service: true
                }
            });
        } catch (error) {
            this.logger.error(`Error updating appointment: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Delete an appointment
     */
    async delete(id: number): Promise<Appointment> {
        try {
            return await this.prisma.appointment.delete({
                where: { id }
            });
        } catch (error) {
            this.logger.error(`Error deleting appointment: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Find all appointments
     */
    async findAll(): Promise<Appointment[]> {
        try {
            return await this.prisma.appointment.findMany({
                include: {
                    client: true,
                    professional: true,
                    service: true
                },
                orderBy: {
                    datetime: 'asc'
                }
            });
        } catch (error) {
            this.logger.error(`Error finding all appointments: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Find appointments by client ID
     */
    async findByClientId(clientId: number): Promise<Appointment[]> {
        try {
            return await this.prisma.appointment.findMany({
                where: {
                    client_id: clientId
                },
                include: {
                    professional: true,
                    service: true
                },
                orderBy: {
                    datetime: 'asc'
                }
            });
        } catch (error) {
            this.logger.error(`Error finding appointments by client ID: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Find appointments by professional ID
     */
    async findByProfessionalId(professionalId: number): Promise<Appointment[]> {
        try {
            return await this.prisma.appointment.findMany({
                where: {
                    professional_id: professionalId
                },
                include: {
                    client: true,
                    service: true
                },
                orderBy: {
                    datetime: 'asc'
                }
            });
        } catch (error) {
            this.logger.error(`Error finding appointments by professional ID: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Find appointments by date range
     */
    async findByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
        try {
            return await this.prisma.appointment.findMany({
                where: {
                    datetime: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                include: {
                    client: true,
                    professional: true,
                    service: true
                },
                orderBy: {
                    datetime: 'asc'
                }
            });
        } catch (error) {
            this.logger.error(`Error finding appointments by date range: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Find appointments by status
     */
    async findByStatus(status: string): Promise<Appointment[]> {
        try {
            return await this.prisma.appointment.findMany({
                where: {
                    status
                },
                include: {
                    client: true,
                    professional: true,
                    service: true
                },
                orderBy: {
                    datetime: 'asc'
                }
            });
        } catch (error) {
            this.logger.error(`Error finding appointments by status: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Find appointments with filters
     */
    async findWithFilters(filters: AppointmentFilter): Promise<Appointment[]> {
        try {
            const where: any = {};

            if (filters.clientId !== undefined) {
                where.client_id = filters.clientId;
            }

            if (filters.professionalId !== undefined) {
                where.professional_id = filters.professionalId;
            }

            if (filters.serviceId !== undefined) {
                where.service_id = filters.serviceId;
            }

            if (filters.status !== undefined) {
                where.status = filters.status;
            }

            if (filters.startDate !== undefined || filters.endDate !== undefined) {
                where.datetime = {};
                if (filters.startDate !== undefined) {
                    where.datetime.gte = filters.startDate;
                }
                if (filters.endDate !== undefined) {
                    where.datetime.lte = filters.endDate;
                }
            }

            return await this.prisma.appointment.findMany({
                where,
                include: {
                    client: true,
                    professional: true,
                    service: true
                },
                orderBy: {
                    datetime: 'asc'
                }
            });
        } catch (error) {
            this.logger.error(`Error finding appointments with filters: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Cancel an appointment
     */
    async cancelAppointment(id: number): Promise<Appointment> {
        try {
            return await this.prisma.appointment.update({
                where: { id },
                data: {
                    status: 'cancelled'
                },
                include: {
                    client: true,
                    professional: true,
                    service: true
                }
            });
        } catch (error) {
            this.logger.error(`Error canceling appointment: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Complete an appointment
     */
    async completeAppointment(id: number): Promise<Appointment> {
        try {
            return await this.prisma.appointment.update({
                where: { id },
                data: {
                    status: 'completed'
                },
                include: {
                    client: true,
                    professional: true,
                    service: true
                }
            });
        } catch (error) {
            this.logger.error(`Error completing appointment: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Check for appointment conflicts
     * Returns true if there is a conflict, false otherwise
     */
    async checkForConflicts(professionalId: number, date: Date, durationMinutes: number): Promise<boolean> {
        try {
            const startTime = new Date(date);
            const endTime = new Date(date);
            endTime.setMinutes(endTime.getMinutes() + durationMinutes);

            const conflictingAppointments = await this.prisma.appointment.findMany({
                where: {
                    professional_id: professionalId,
                    status: {
                        not: 'cancelled'
                    },
                    OR: [
                        // Appointment starts during another appointment
                        {
                            datetime: {
                                lte: startTime
                            },
                            AND: {
                                datetime: {
                                    gte: endTime
                                }
                            }
                        },
                        // Appointment ends during another appointment
                        {
                            datetime: {
                                lte: endTime
                            },
                            AND: {
                                datetime: {
                                    gte: startTime
                                }
                            }
                        }
                    ]
                }
            });

            return conflictingAppointments.length > 0;
        } catch (error) {
            this.logger.error(`Error checking for appointment conflicts: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
}
