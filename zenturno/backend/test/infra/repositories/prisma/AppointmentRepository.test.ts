            import { jest } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { Appointment } from '@prisma/client';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { AppointmentRepository, CreateAppointmentInput, UpdateAppointmentInput } from '../../../../src/infra/repositories/prisma/AppointmentRepository';
import { logger } from '../../../../src/utils/logger';

// Tell Jest to mock the entire @prisma/client module
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        appointment: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        $transaction: jest.fn((callback: (prisma: PrismaClient) => any) => callback(new PrismaClient())), // Mock $transaction to call the callback with a new mocked PrismaClient instance
    })),
}));

// Mock Logger separately
const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
} as unknown as typeof logger;

// Get the mocked PrismaClient instance
const mockPrismaClient = jest.mocked(new PrismaClient(), { shallow: false });

declare global {
  namespace jest {
    interface Matchers<R> {
      toContainObject(object: any): R;
    }
  }
}

describe('AppointmentRepository', () => {
    let appointmentRepository: AppointmentRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        appointmentRepository = new AppointmentRepository(mockPrismaClient, mockLogger);
    });
    
    // Test cases for findById
    describe('#findById', () => {
        it('should find an appointment by id', async () => {
            const mockAppointment: Appointment = {
                id: 1,
                datetime: new Date(),
                client_id: 1,
                professional_id: 1,
                service_id: 1,
                status: 'pending',
                created_at: new Date(),
                updated_at: new Date(),
            };
            mockPrismaClient.appointment.findUnique.mockResolvedValue(mockAppointment);

            const result = await appointmentRepository.findById(1);

            expect(result).toEqual(mockAppointment);
            expect(mockPrismaClient.appointment.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    client: true,
                    professional: true,
                    service: true
                }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should return null if appointment not found', async () => {
            mockPrismaClient.appointment.findUnique.mockResolvedValue(null);

            const result = await appointmentRepository.findById(999);

            expect(result).toBeNull();
            expect(mockPrismaClient.appointment.findUnique).toHaveBeenCalledWith({
                where: { id: 999 },
                include: {
                    client: true,
                    professional: true,
                    service: true
                }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            const error = new Error('Database error');
            mockPrismaClient.appointment.findUnique.mockRejectedValue(error);

            await expect(appointmentRepository.findById(1)).rejects.toThrow('Database error');
            expect(mockPrismaClient.appointment.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    client: true,
                    professional: true,
                    service: true
                }
            });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error finding appointment by ID: ${error.message}`
            );
        });
    });

    // Test cases for create
    describe('#create', () => {
        it('should create a new appointment', async () => {
            const appointmentData: CreateAppointmentInput = {
                datetime: new Date(),
                client_id: 1,
                professional_id: 1,
                service_id: 1,
                status: 'pending'
            };
            
            const mockCreatedAppointment: Appointment = {
                id: 1,
                ...appointmentData,
                status: appointmentData.status || 'pending', // Ensure status is always a string
                created_at: new Date(),
                updated_at: new Date(),
            };
            
            mockPrismaClient.appointment.create.mockResolvedValue(mockCreatedAppointment);

            const result = await appointmentRepository.create(appointmentData);

            expect(result).toEqual(mockCreatedAppointment);
            expect(mockPrismaClient.appointment.create).toHaveBeenCalledWith({
                data: appointmentData,
                include: {
                    client: true,
                    professional: true,
                    service: true
                }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            const appointmentData: CreateAppointmentInput = {
                datetime: new Date(),
                client_id: 1,
                professional_id: 1,
                service_id: 1
            };
            
            const error = new Error('Database error');
            mockPrismaClient.appointment.create.mockRejectedValue(error);

            await expect(appointmentRepository.create(appointmentData)).rejects.toThrow('Database error');
            expect(mockPrismaClient.appointment.create).toHaveBeenCalledWith({
                data: appointmentData,
                include: {
                    client: true,
                    professional: true,
                    service: true
                }
            });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error creating appointment: ${error.message}`
            );
        });
    });

    // Test cases for update
    describe('#update', () => {
        it('should update an existing appointment with multiple fields', async () => {
            const updateData: UpdateAppointmentInput = {
                datetime: new Date('2023-02-15T10:00:00Z'),
                status: 'confirmed',
                client_id: 2,
                professional_id: 3
            };
            
            const mockUpdatedAppointment: Appointment = {
                id: 1,
                datetime: updateData.datetime!,
                client_id: updateData.client_id!,
                professional_id: updateData.professional_id!,
                service_id: 1,
                status: updateData.status || 'updated', // Ensure status is always a string
                created_at: new Date(),
                updated_at: new Date(),
            };
            
            mockPrismaClient.appointment.update.mockResolvedValue(mockUpdatedAppointment);

            const result = await appointmentRepository.update(1, updateData);

            expect(result).toEqual(mockUpdatedAppointment);
            expect(mockPrismaClient.appointment.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateData,
                include: {
                    client: true,
                    professional: true,
                    service: true
                }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should update only provided fields', async () => {
            const updateData: UpdateAppointmentInput = {
                status: 'confirmed'
            };
            
            const mockUpdatedAppointment: Appointment = {
                id: 1,
                datetime: new Date(),
                client_id: 1,
                professional_id: 1,
                service_id: 1,
                status: 'confirmed',
                created_at: new Date(),
                updated_at: new Date(),
            };
            
            mockPrismaClient.appointment.update.mockResolvedValue(mockUpdatedAppointment);

            const result = await appointmentRepository.update(1, updateData);

            expect(result).toEqual(mockUpdatedAppointment);
            expect(mockPrismaClient.appointment.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateData,
                include: {
                    client: true,
                    professional: true,
                    service: true
                }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if appointment to update is not found', async () => {
            const updateData: UpdateAppointmentInput = {
                status: 'confirmed'
            };
            
            const error = new Error('Record to update not found');
            mockPrismaClient.appointment.update.mockRejectedValue(error);

            await expect(appointmentRepository.update(999, updateData)).rejects.toThrow('Record to update not found');
            expect(mockPrismaClient.appointment.update).toHaveBeenCalledWith({
                where: { id: 999 },
                data: updateData,
                include: {
                    client: true,
                    professional: true,
                    service: true
                }
            });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error updating appointment: ${error.message}`
            );
        });

        it('should throw an error if prisma call fails', async () => {
            const updateData: UpdateAppointmentInput = {
                status: 'confirmed'
            };
            
            const error = new Error('Database error');
            mockPrismaClient.appointment.update.mockRejectedValue(error);

            await expect(appointmentRepository.update(1, updateData)).rejects.toThrow('Database error');
            expect(mockPrismaClient.appointment.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateData,
                include: {
                    client: true,
                    professional: true,
                    service: true
                }
            });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error updating appointment: ${error.message}`
            );
        });
    });
    
    // Test cases for delete
    describe('#delete', () => {
        it('should delete an appointment', async () => {
            const mockDeletedAppointment: Appointment = {
                id: 1,
                datetime: new Date(),
                client_id: 1,
                professional_id: 1,
                service_id: 1,
                status: 'cancelled',
                created_at: new Date(),
                updated_at: new Date(),
            };
            mockPrismaClient.appointment.delete.mockResolvedValue(mockDeletedAppointment);

            const result = await appointmentRepository.delete(1);

            expect(result).toEqual(mockDeletedAppointment);
            expect(mockPrismaClient.appointment.delete).toHaveBeenCalledWith({
                where: { id: 1 }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            const error = new Error('Database error');
            mockPrismaClient.appointment.delete.mockRejectedValue(error);

            await expect(appointmentRepository.delete(1)).rejects.toThrow('Database error');
            expect(mockPrismaClient.appointment.delete).toHaveBeenCalledWith({
                where: { id: 1 }
            });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error deleting appointment: ${error.message}`
            );
        });
    });
    
    // Test cases for findAll
    describe('#findAll', () => {
        it('should return all appointments', async () => {
            const mockAppointments: Appointment[] = [
                {
                    id: 1,
                    datetime: new Date(),
                    client_id: 1,
                    professional_id: 1,
                    service_id: 1,
                    status: 'pending',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: 2,
                    datetime: new Date(),
                    client_id: 2,
                    professional_id: 2,
                    service_id: 2,
                    status: 'confirmed',
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            ];
            mockPrismaClient.appointment.findMany.mockResolvedValue(mockAppointments);

            const result = await appointmentRepository.findAll();

            expect(result).toEqual(mockAppointments);
            expect(mockPrismaClient.appointment.findMany).toHaveBeenCalledWith({
                include: {
                    client: true,
                    professional: true,
                    service: true
                },
                orderBy: {
                    datetime: 'asc'
                }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should return empty array if no appointments found', async () => {
            mockPrismaClient.appointment.findMany.mockResolvedValue([]);

            const result = await appointmentRepository.findAll();

            expect(result).toEqual([]);
            expect(mockPrismaClient.appointment.findMany).toHaveBeenCalledWith({
                include: {
                    client: true,
                    professional: true,
                    service: true
                },
                orderBy: {
                    datetime: 'asc'
                }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            const error = new Error('Database error');
            mockPrismaClient.appointment.findMany.mockRejectedValue(error);

            await expect(appointmentRepository.findAll()).rejects.toThrow('Database error');
            expect(mockPrismaClient.appointment.findMany).toHaveBeenCalledWith({
                include: {
                    client: true,
                    professional: true,
                    service: true
                },
                orderBy: {
                    datetime: 'asc'
                }
            });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error finding all appointments: ${error.message}`
            );
        });
    });
    
    // Test cases for findByClientId
    describe('#findByClientId', () => {
        it('should return appointments for a specific client', async () => {
            const clientId = 1;
            const mockAppointments: Appointment[] = [
                {
                    id: 1,
                    datetime: new Date(),
                    client_id: clientId,
                    professional_id: 1,
                    service_id: 1,
                    status: 'pending',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: 2,
                    datetime: new Date(),
                    client_id: clientId,
                    professional_id: 2,
                    service_id: 2,
                    status: 'confirmed',
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            ];
            mockPrismaClient.appointment.findMany.mockResolvedValue(mockAppointments);

            const result = await appointmentRepository.findByClientId(clientId);

            expect(result).toEqual(mockAppointments);
            expect(mockPrismaClient.appointment.findMany).toHaveBeenCalledWith({
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
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should return empty array if no appointments found for client', async () => {
            const clientId = 999;
            mockPrismaClient.appointment.findMany.mockResolvedValue([]);

            const result = await appointmentRepository.findByClientId(clientId);

            expect(result).toEqual([]);
            expect(mockPrismaClient.appointment.findMany).toHaveBeenCalledWith({
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
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            const clientId = 1;
            const error = new Error('Database error');
            mockPrismaClient.appointment.findMany.mockRejectedValue(error);

            await expect(appointmentRepository.findByClientId(clientId)).rejects.toThrow('Database error');
            expect(mockPrismaClient.appointment.findMany).toHaveBeenCalledWith({
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
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error finding appointments by client ID: ${error.message}`
            );
        });
    });
    
    // Test cases for findByProfessionalId
    describe('#findByProfessionalId', () => {
        it('should return appointments for a specific professional', async () => {
            const professionalId = 1;
            const mockAppointments: Appointment[] = [
                {
                    id: 1,
                    datetime: new Date(),
                    client_id: 1,
                    professional_id: professionalId,
                    service_id: 1,
                    status: 'pending',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: 2,
                    datetime: new Date(),
                    client_id: 2,
                    professional_id: professionalId,
                    service_id: 2,
                    status: 'confirmed',
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            ];
            mockPrismaClient.appointment.findMany.mockResolvedValue(mockAppointments);

            const result = await appointmentRepository.findByProfessionalId(professionalId);

            expect(result).toEqual(mockAppointments);
            expect(mockPrismaClient.appointment.findMany).toHaveBeenCalledWith({
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
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should return empty array if no appointments found for professional', async () => {
            const professionalId = 999;
            mockPrismaClient.appointment.findMany.mockResolvedValue([]);

            const result = await appointmentRepository.findByProfessionalId(professionalId);

            expect(result).toEqual([]);
            expect(mockPrismaClient.appointment.findMany).toHaveBeenCalledWith({
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
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            const professionalId = 1;
            const error = new Error('Database error');
            mockPrismaClient.appointment.findMany.mockRejectedValue(error);

            await expect(appointmentRepository.findByProfessionalId(professionalId)).rejects.toThrow('Database error');
            expect(mockPrismaClient.appointment.findMany).toHaveBeenCalledWith({
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
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error finding appointments by professional ID: ${error.message}`
            );
        });
    });
    
    // Test cases for findByDateRange
    describe('#findByDateRange', () => {
        it('should return appointments within a date range', async () => {
            const startDate = new Date('2023-01-01');
            const endDate = new Date('2023-01-31');
            const mockAppointments: Appointment[] = [
                {
                    id: 1,
                    datetime: new Date('2023-01-15'),
                    client_id: 1,
                    professional_id: 1,
                    service_id: 1,
                    status: 'pending',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: 2,
                    datetime: new Date('2023-01-20'),
                    client_id: 2,
                    professional_id: 2,
                    service_id: 2,
                    status: 'confirmed',
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            ];
            mockPrismaClient.appointment.findMany.mockResolvedValue(mockAppointments);

            const result = await appointmentRepository.findByDateRange(startDate, endDate);

            expect(result).toEqual(mockAppointments);
            expect(mockPrismaClient.appointment.findMany).toHaveBeenCalledWith({
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
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should return empty array if no appointments found in date range', async () => {
            const startDate = new Date('2023-02-01');
            const endDate = new Date('2023-02-28');
            mockPrismaClient.appointment.findMany.mockResolvedValue([]);

            const result = await appointmentRepository.findByDateRange(startDate, endDate);

            expect(result).toEqual([]);
            expect(mockPrismaClient.appointment.findMany).toHaveBeenCalledWith({
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
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            const startDate = new Date('2023-01-01');
            const endDate = new Date('2023-01-31');
            const error = new Error('Database error');
            mockPrismaClient.appointment.findMany.mockRejectedValue(error);

            await expect(appointmentRepository.findByDateRange(startDate, endDate)).rejects.toThrow('Database error');
            expect(mockPrismaClient.appointment.findMany).toHaveBeenCalledWith({
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
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error finding appointments by date range: ${error.message}`
            );
        });
    });
    
    // Test cases for findByStatus
    describe('#findByStatus', () => {
        it('should return appointments with a specific status', async () => {
            const status = 'pending';
            const mockAppointments: Appointment[] = [
                {
                    id: 1,
                    datetime: new Date(),
                    client_id: 1,
                    professional_id: 1,
                    service_id: 1,
                    status: status,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: 2,
                    datetime: new Date(),
                    client_id: 2,
                    professional_id: 2,
                    service_id: 2,
                    status: status,
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            ];
            mockPrismaClient.appointment.findMany.mockResolvedValue(mockAppointments);

            const result = await appointmentRepository.findByStatus(status);

            expect(result).toEqual(mockAppointments);
            expect(mockPrismaClient.appointment.findMany).toHaveBeenCalledWith({
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
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should return empty array if no appointments found with status', async () => {
            const status = 'cancelled';
            mockPrismaClient.appointment.findMany.mockResolvedValue([]);

            const result = await appointmentRepository.findByStatus(status);

            expect(result).toEqual([]);
            expect(mockPrismaClient.appointment.findMany).toHaveBeenCalledWith({
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
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            const status = 'pending';
            const error = new Error('Database error');
            mockPrismaClient.appointment.findMany.mockRejectedValue(error);

            await expect(appointmentRepository.findByStatus(status)).rejects.toThrow('Database error');
            expect(mockPrismaClient.appointment.findMany).toHaveBeenCalledWith({
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
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error finding appointments by status: ${error.message}`
            );
        });
    });
    
    // Test cases for findWithFilters
    describe('#findWithFilters', () => {
        it('should return appointments with all filters applied', async () => {
            const filters = {
                clientId: 1,
                professionalId: 2,
                serviceId: 3,
                status: 'pending',
                startDate: new Date('2023-01-01'),
                endDate: new Date('2023-01-31')
            };
            
            const mockAppointments: Appointment[] = [
                {
                    id: 1,
                    datetime: new Date('2023-01-15'),
                    client_id: filters.clientId,
                    professional_id: filters.professionalId,
                    service_id: filters.serviceId,
                    status: filters.status,
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            ];
            mockPrismaClient.appointment.findMany.mockResolvedValue(mockAppointments);

            const result = await appointmentRepository.findWithFilters(filters);

            expect(result).toEqual(mockAppointments);
            expect(mockPrismaClient.appointment.findMany).toHaveBeenCalledWith({
                where: {
                    client_id: filters.clientId,
                    professional_id: filters.professionalId,
                    service_id: filters.serviceId,
                    status: filters.status,
                    datetime: {
                        gte: filters.startDate,
                        lte: filters.endDate
                    }
                },
                include: {
                    client: true,
                    professional: true,
                    service: true,
                },
                orderBy: {
                    datetime: "asc",
                }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should apply date range filters correctly', async () => {
            const filters = {
                startDate: new Date('2023-01-01'),
                endDate: new Date('2023-01-31')
            };
            
            const mockAppointments: Appointment[] = [
                {
                    id: 1,
                    datetime: new Date('2023-01-15'),
                    client_id: 1,
                    professional_id: 1,
                    service_id: 1,
                    status: 'pending',
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            ];
            mockPrismaClient.appointment.findMany.mockResolvedValue(mockAppointments);

            const result = await appointmentRepository.findWithFilters(filters);

            expect(result).toEqual(mockAppointments);
            expect(mockPrismaClient.appointment.findMany).toHaveBeenCalledWith({
                where: {
                    datetime: {
                        gte: filters.startDate,
                        lte: filters.endDate
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
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should return empty array if no appointments match filters', async () => {
            const filters = {
                status: 'cancelled',
                professionalId: 999
            };
            
            mockPrismaClient.appointment.findMany.mockResolvedValue([]);

            const result = await appointmentRepository.findWithFilters(filters);

            expect(result).toEqual([]);
            expect(mockPrismaClient.appointment.findMany).toHaveBeenCalledWith({
                where: {
                    status: filters.status,
                    professional_id: filters.professionalId
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
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            const filters = {
                clientId: 1,
                status: 'pending'
            };
            
            const error = new Error('Database error');
            mockPrismaClient.appointment.findMany.mockRejectedValue(error);

            await expect(appointmentRepository.findWithFilters(filters)).rejects.toThrow('Database error');
            expect(mockPrismaClient.appointment.findMany).toHaveBeenCalledWith({
                where: {
                    client_id: filters.clientId,
                    status: filters.status
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
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error finding appointments with filters: ${error.message}`
            );
        });
    });
    
    // Test cases for update
    describe('#update', () => {
        it('should update an appointment and return the updated appointment', async () => {
            const id = 1;
            const updateData = {
                datetime: new Date('2023-02-15T14:00:00Z'),
                status: 'confirmed',
                service_id: 2
            };
            
            const mockUpdatedAppointment: Appointment = {
                id,
                datetime: updateData.datetime,
                client_id: 1,
                professional_id: 1,
                service_id: updateData.service_id,
                status: updateData.status,
                created_at: new Date(),
                updated_at: new Date()
            };
            
            mockPrismaClient.appointment.update.mockResolvedValue(mockUpdatedAppointment);

            const result = await appointmentRepository.update(id, updateData);

            expect(result).toEqual(mockUpdatedAppointment);
            expect(mockPrismaClient.appointment.update).toHaveBeenCalledWith({
                where: { id },
                data: updateData,
                include: {
                    client: true,
                    professional: true,
                    service: true
                }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should update only the provided fields', async () => {
            const id = 1;
            const updateData = {
                status: 'cancelled'
            };
            
            const mockUpdatedAppointment: Appointment = {
                id,
                datetime: new Date(),
                client_id: 1,
                professional_id: 1,
                service_id: 1,
                status: updateData.status,
                created_at: new Date(),
                updated_at: new Date()
            };
            
            mockPrismaClient.appointment.update.mockResolvedValue(mockUpdatedAppointment);

            const result = await appointmentRepository.update(id, updateData);

            expect(result).toEqual(mockUpdatedAppointment);
            expect(mockPrismaClient.appointment.update).toHaveBeenCalledWith({
                where: { id },
                data: updateData,
                include: {
                    client: true,
                    professional: true,
                    service: true
                }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if appointment not found', async () => {
            const id = 999;
            const updateData = {
                status: 'cancelled'
            };
            
            const error = new Error('Record to update not found');
            mockPrismaClient.appointment.update.mockRejectedValue(error);

            await expect(appointmentRepository.update(id, updateData)).rejects.toThrow('Record to update not found');
            expect(mockPrismaClient.appointment.update).toHaveBeenCalledWith({
                where: { id },
                data: updateData,
                include: {
                    client: true,
                    professional: true,
                    service: true
                }
            });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error updating appointment: ${error.message}`
            );
        });

        it('should throw an error if prisma call fails', async () => {
            const id = 1;
            const updateData = {
                datetime: new Date('2023-02-15T14:00:00Z')
            };
            
            const error = new Error('Database error');
            mockPrismaClient.appointment.update.mockRejectedValue(error);

            await expect(appointmentRepository.update(id, updateData)).rejects.toThrow('Database error');
            expect(mockPrismaClient.appointment.update).toHaveBeenCalledWith({
                where: { id },
                data: updateData,
                include: {
                    client: true,
                    professional: true,
                    service: true
                }
            });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error updating appointment: ${error.message}`
            );
        });
    });

    // Test cases for cancelAppointment
    describe('#cancelAppointment', () => {
        it('should update the appointment status to cancelled', async () => {
            const mockCancelledAppointment: Appointment = {
                id: 1,
                datetime: new Date(),
                client_id: 1,
                professional_id: 1,
                service_id: 1,
                status: 'cancelled',
                created_at: new Date(),
                updated_at: new Date(),
            };
            mockPrismaClient.appointment.update.mockResolvedValue(mockCancelledAppointment);

            const result = await appointmentRepository.cancelAppointment(1);

            expect(result).toEqual(mockCancelledAppointment);
            expect(mockPrismaClient.appointment.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { status: 'cancelled' },
                include: {
                    client: true,
                    professional: true,
                    service: true
                }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            const error = new Error('Database error');
            mockPrismaClient.appointment.update.mockRejectedValue(error);

            await expect(appointmentRepository.cancelAppointment(1)).rejects.toThrow('Database error');
            expect(mockPrismaClient.appointment.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { status: 'cancelled' },
                include: {
                    client: true,
                    professional: true,
                    service: true
                }
            });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error canceling appointment: ${error.message}`
            );
        });
    });

    // Test cases for completeAppointment
    describe('#completeAppointment', () => {
        it('should update the appointment status to completed', async () => {
            const mockCompletedAppointment: Appointment = {
                id: 1,
                datetime: new Date(),
                client_id: 1,
                professional_id: 1,
                service_id: 1,
                status: 'completed',
                created_at: new Date(),
                updated_at: new Date(),
            };
            mockPrismaClient.appointment.update.mockResolvedValue(mockCompletedAppointment);

            const result = await appointmentRepository.completeAppointment(1);

            expect(result).toEqual(mockCompletedAppointment);
            expect(mockPrismaClient.appointment.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { status: 'completed' },
                include: {
                    client: true,
                    professional: true,
                    service: true
                }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            const error = new Error('Database error');
            mockPrismaClient.appointment.update.mockRejectedValue(error);

            await expect(appointmentRepository.completeAppointment(1)).rejects.toThrow('Database error');
            expect(mockPrismaClient.appointment.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { status: 'completed' },
                include: {
                    client: true,
                    professional: true,
                    service: true
                }
            });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error completing appointment: ${error.message}`
            );
        });
    });

    // Test cases for checkForConflicts
    describe('#checkForConflicts', () => {
        it('should return true if there is a conflict (start time within existing appointment)', async () => {
            const professionalId = 1;
            const date = new Date('2024-01-01T10:00:00Z');
            const durationMinutes = 60;
            const existingAppointment: Appointment[] = [
                {
                    id: 1,
                    datetime: new Date('2024-01-01T09:30:00Z'),
                    client_id: 1,
                    professional_id: 1,
                    service_id: 1,
                    status: 'pending',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ];
            mockPrismaClient.appointment.findMany.mockResolvedValue(existingAppointment);

            const result = await appointmentRepository.checkForConflicts(professionalId, date, durationMinutes);

            expect(result).toBe(true);
            expect(mockPrismaClient.appointment.findMany).toHaveBeenCalled();
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should return true if there is a conflict (end time within existing appointment)', async () => {
            const professionalId = 1;
            const date = new Date('2024-01-01T10:30:00Z');
            const durationMinutes = 60;
            const existingAppointment: Appointment[] = [
                {
                    id: 1,
                    datetime: new Date('2024-01-01T10:00:00Z'),
                    client_id: 1,
                    professional_id: 1,
                    service_id: 1,
                    status: 'pending',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ];
            mockPrismaClient.appointment.findMany.mockResolvedValue(existingAppointment);

            const result = await appointmentRepository.checkForConflicts(professionalId, date, durationMinutes);

            expect(result).toBe(true);
            expect(mockPrismaClient.appointment.findMany).toHaveBeenCalled();
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should return true if there is a conflict (new appointment encompasses existing one)', async () => {
            const professionalId = 1;
            const date = new Date('2024-01-01T09:00:00Z');
            const durationMinutes = 120;
            const existingAppointment: Appointment[] = [
                {
                    id: 1,
                    datetime: new Date('2024-01-01T10:00:00Z'),
                    client_id: 1,
                    professional_id: 1,
                    service_id: 1,
                    status: 'pending',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ];
            mockPrismaClient.appointment.findMany.mockResolvedValue(existingAppointment);

            const result = await appointmentRepository.checkForConflicts(professionalId, date, durationMinutes);

            expect(result).toBe(true);
            expect(mockPrismaClient.appointment.findMany).toHaveBeenCalled();
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should return true if there is a conflict (existing appointment encompasses new one)', async () => {
            const professionalId = 1;
            const date = new Date('2024-01-01T10:30:00Z');
            const durationMinutes = 30;
            const existingAppointment: Appointment[] = [
                {
                    id: 1,
                    datetime: new Date('2024-01-01T10:00:00Z'),
                    client_id: 1,
                    professional_id: 1,
                    service_id: 1,
                    status: 'pending',
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ];
            mockPrismaClient.appointment.findMany.mockResolvedValue(existingAppointment);

            const result = await appointmentRepository.checkForConflicts(professionalId, date, durationMinutes);

            expect(result).toBe(true);
            expect(mockPrismaClient.appointment.findMany).toHaveBeenCalled();
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should return false if there are no conflicts', async () => {
            const professionalId = 1;
            const date = new Date('2024-01-01T10:00:00Z');
            const durationMinutes = 60;
            mockPrismaClient.appointment.findMany.mockResolvedValue([]);

            const result = await appointmentRepository.checkForConflicts(professionalId, date, durationMinutes);

            expect(result).toBe(false);
            expect(mockPrismaClient.appointment.findMany).toHaveBeenCalled();
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            const professionalId = 1;
            const date = new Date('2024-01-01T10:00:00Z');
            const durationMinutes = 60;
            const error = new Error('Database error');
            mockPrismaClient.appointment.findMany.mockRejectedValue(error);

            await expect(appointmentRepository.checkForConflicts(professionalId, date, durationMinutes)).rejects.toThrow('Database error');
            expect(mockPrismaClient.appointment.findMany).toHaveBeenCalled();
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error checking for appointment conflicts: ${error.message}`
            );
        });
    });
});
