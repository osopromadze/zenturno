import { prisma } from '../../db/prisma';
import { Professional } from '@prisma/client';
import { logger } from '../../../utils/logger';

export interface CreateProfessionalInput {
    name: string;
    specialty?: string;
    user_id?: number;
}

export interface UpdateProfessionalInput {
    name?: string;
    specialty?: string;
    user_id?: number;
}

export class ProfessionalRepository {
    /**
     * Find a professional by ID
     */
    async findById(id: number): Promise<Professional | null> {
        try {
            return await prisma.professional.findUnique({
                where: { id },
                include: {
                    user: true,
                    appointments: true
                }
            });
        } catch (error) {
            logger.error(`Error finding professional by ID: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Find a professional by user ID
     */
    async findByUserId(userId: number): Promise<Professional | null> {
        try {
            return await prisma.professional.findUnique({
                where: { user_id: userId },
                include: {
                    user: true,
                    appointments: true
                }
            });
        } catch (error) {
            logger.error(`Error finding professional by user ID: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Create a new professional
     */
    async create(data: CreateProfessionalInput): Promise<Professional> {
        try {
            return await prisma.professional.create({
                data,
                include: {
                    user: true
                }
            });
        } catch (error) {
            logger.error(`Error creating professional: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Update an existing professional
     */
    async update(id: number, data: UpdateProfessionalInput): Promise<Professional> {
        try {
            return await prisma.professional.update({
                where: { id },
                data,
                include: {
                    user: true
                }
            });
        } catch (error) {
            logger.error(`Error updating professional: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Delete a professional
     */
    async delete(id: number): Promise<Professional> {
        try {
            return await prisma.professional.delete({
                where: { id }
            });
        } catch (error) {
            logger.error(`Error deleting professional: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Find all professionals
     */
    async findAll(): Promise<Professional[]> {
        try {
            return await prisma.professional.findMany({
                include: {
                    user: true
                }
            });
        } catch (error) {
            logger.error(`Error finding all professionals: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Find professionals by specialty
     */
    async findBySpecialty(specialty: string): Promise<Professional[]> {
        try {
            return await prisma.professional.findMany({
                where: {
                    specialty: {
                        contains: specialty,
                        mode: 'insensitive'
                    }
                },
                include: {
                    user: true
                }
            });
        } catch (error) {
            logger.error(`Error finding professionals by specialty: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Get professional availability
     * Returns a list of available time slots for a professional on a given date
     */
    async getAvailability(professionalId: number, date: Date): Promise<Date[]> {
        try {
            // Get all appointments for this professional on the given date
            const appointments = await prisma.appointment.findMany({
                where: {
                    professional_id: professionalId,
                    datetime: {
                        gte: new Date(date.setHours(0, 0, 0, 0)),
                        lt: new Date(date.setHours(23, 59, 59, 999))
                    }
                },
                include: {
                    service: true
                }
            });

            // Get the professional's working hours (this would come from a settings table in a real app)
            // For now, we'll assume 9 AM to 5 PM
            const startHour = 9;
            const endHour = 17;
            const slotDuration = 30; // minutes

            // Generate all possible time slots
            const allSlots: Date[] = [];
            for (let hour = startHour; hour < endHour; hour++) {
                for (let minute = 0; minute < 60; minute += slotDuration) {
                    const slot = new Date(date);
                    slot.setHours(hour, minute, 0, 0);
                    allSlots.push(slot);
                }
            }

            // Filter out slots that overlap with existing appointments
            return allSlots.filter(slot => {
                return !appointments.some((appointment: { datetime: Date; service?: { duration_minutes?: number } | null }) => {
                    const appointmentStart = new Date(appointment.datetime);
                    const appointmentEnd = new Date(appointmentStart);
                    appointmentEnd.setMinutes(appointmentEnd.getMinutes() + (appointment.service?.duration_minutes || 30));

                    const slotEnd = new Date(slot);
                    slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

                    return (
                        (slot >= appointmentStart && slot < appointmentEnd) ||
                        (slotEnd > appointmentStart && slotEnd <= appointmentEnd) ||
                        (slot <= appointmentStart && slotEnd >= appointmentEnd)
                    );
                });
            });
        } catch (error) {
            logger.error(`Error getting professional availability: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
}
