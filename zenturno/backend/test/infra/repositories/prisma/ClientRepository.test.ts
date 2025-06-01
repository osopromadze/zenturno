import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Client, PrismaClient } from '@prisma/client';

// Mock the singleton prisma client and logger
type MockedPrismaClientClient = {
    client: {
        findUnique: jest.Mock<typeof PrismaClient.prototype.client.findUnique>,
        create: jest.Mock<typeof PrismaClient.prototype.client.create>,
        update: jest.Mock<typeof PrismaClient.prototype.client.update>,
        delete: jest.Mock<typeof PrismaClient.prototype.client.delete>,
        findMany: jest.Mock<typeof PrismaClient.prototype.client.findMany>,
    };
    appointment: {
        findMany: jest.Mock<any>,
    };
};

const mockPrismaClient: MockedPrismaClientClient = {
    client: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
    },
    appointment: {
        findMany: jest.fn(),
    },
};

jest.doMock('@infra/db/prisma', () => ({
    prisma: mockPrismaClient,
}));

const mockLogger = {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
};

jest.doMock('@utils/logger', () => ({
    logger: mockLogger,
}));

import { ClientRepository, CreateClientInput, UpdateClientInput } from '@infra/repositories/prisma/ClientRepository';

describe('ClientRepository', () => {
    let clientRepository: ClientRepository;

    beforeEach(() => {
        clientRepository = new ClientRepository(); // No arguments needed
        jest.clearAllMocks();
    });

    // Test cases for findById
    describe('#findById', () => {
        it('should return a client if found', async () => {
            // Arrange
            const mockClient: Client = {
                id: 1,
                name: 'Test Client',
                phone: '123-456-7890' as string | null,
                user_id: 1,
                created_at: new Date(),
                updated_at: new Date(),
            };
            mockPrismaClient.client.findUnique.mockResolvedValue(mockClient);

            // Act
            const result = await clientRepository.findById(1);

            // Assert
            expect(result).toEqual(mockClient);
            expect(mockPrismaClient.client.findUnique).toHaveBeenCalledWith({ where: { id: 1 }, include: { user: true, appointments: true } });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should return null if client not found', async () => {
            // Arrange
            mockPrismaClient.client.findUnique.mockResolvedValue(null);

            // Act
            const result = await clientRepository.findById(999);

            // Assert
            expect(result).toEqual(null);
            expect(mockPrismaClient.client.findUnique).toHaveBeenCalledWith({ where: { id: 999 }, include: { user: true, appointments: true } });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            // Arrange
            const error = new Error('Database error');
            mockPrismaClient.client.findUnique.mockRejectedValue(error);

            // Act & Assert
            await expect(clientRepository.findById(1)).rejects.toThrow('Database error');
            expect(mockPrismaClient.client.findUnique).toHaveBeenCalledWith({ where: { id: 1 }, include: { user: true, appointments: true } });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error finding client by ID: ${error.message}`
            );
        });
    });

    // Test cases for create
    describe('#create', () => {
        it('should create and return a new client', async () => {
            // Arrange
            const createData: CreateClientInput = {
                name: 'New Client',
                phone: '987-654-3210' as string | null,
                user_id: 2,
            };
            const mockNewClient: Client = {
                id: 2,
                ...createData,
                created_at: new Date(),
                updated_at: new Date(),
            };
            mockPrismaClient.client.create.mockResolvedValue(mockNewClient);

            // Act
            const result = await clientRepository.create(createData);

            // Assert
            expect(result).toEqual(mockNewClient);
            expect(mockPrismaClient.client.create).toHaveBeenCalledWith({ data: createData, include: { user: true } });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            // Arrange
            const createData: CreateClientInput = {
                name: 'New Client',
                phone: '987-654-3210' as string | null,
                user_id: 2,
            };
            const error = new Error('Database error');
            mockPrismaClient.client.create.mockRejectedValue(error);

            // Act & Assert
            await expect(clientRepository.create(createData)).rejects.toThrow('Database error');
            expect(mockPrismaClient.client.create).toHaveBeenCalledWith({ data: createData, include: { user: true } });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error creating client: ${error.message}`
            );
        });
    });

    // Test cases for update
    describe('#update', () => {
        it('should update and return the updated client', async () => {
            // Arrange
            const updateData: UpdateClientInput = { name: 'Updated Client' };
            const mockUpdatedClient: Client = {
                id: 1,
                name: 'Updated Client',
                phone: '123-456-7890' as string | null,
                user_id: 1,
                created_at: new Date(),
                updated_at: new Date(),
            };
            mockPrismaClient.client.update.mockResolvedValue(mockUpdatedClient);

            // Act
            const result = await clientRepository.update(1, updateData);

            // Assert
            expect(result).toEqual(mockUpdatedClient);
            expect(mockPrismaClient.client.update).toHaveBeenCalledWith({ where: { id: 1 }, data: updateData, include: { user: true } });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if client not found for update', async () => {
            // Arrange
            const updateData: UpdateClientInput = { name: 'Nonexistent Client' };
            const error = new Error('Client not found');
            mockPrismaClient.client.update.mockRejectedValue(error);

            // Act & Assert
            await expect(clientRepository.update(999, updateData)).rejects.toThrow('Client not found');
            expect(mockPrismaClient.client.update).toHaveBeenCalledWith({ where: { id: 999 }, data: updateData, include: { user: true } });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error updating client: ${error.message}`
            );
        });

        it('should throw an error if prisma call fails', async () => {
            // Arrange
            const updateData: UpdateClientInput = { name: 'Updated Client' };
            const error = new Error('Database error');
            mockPrismaClient.client.update.mockRejectedValue(error);

            // Act & Assert
            await expect(clientRepository.update(1, updateData)).rejects.toThrow('Database error');
            expect(mockPrismaClient.client.update).toHaveBeenCalledWith({ where: { id: 1 }, data: updateData, include: { user: true } });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error updating client: ${error.message}`
            );
        });
    });

    // Test cases for delete
    describe('#delete', () => {
        it('should delete and return the deleted client', async () => {
            // Arrange
            const mockDeletedClient: Client = {
                id: 1,
                name: 'Deleted Client',
                phone: '123-456-7890' as string | null,
                user_id: 1,
                created_at: new Date(),
                updated_at: new Date(),
            };
            mockPrismaClient.client.delete.mockResolvedValue(mockDeletedClient);

            // Act
            const result = await clientRepository.delete(1);

            // Assert
            expect(result).toEqual(mockDeletedClient);
            expect(mockPrismaClient.client.delete).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if client not found for delete', async () => {
            // Arrange
            const error = new Error('Client not found');
            mockPrismaClient.client.delete.mockRejectedValue(error);

            // Act & Assert
            await expect(clientRepository.delete(999)).rejects.toThrow('Client not found');
            expect(mockPrismaClient.client.delete).toHaveBeenCalledWith({ where: { id: 999 } });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error deleting client: ${error.message}`
            );
        });

        it('should throw an error if prisma call fails', async () => {
            // Arrange
            const error = new Error('Database error');
            mockPrismaClient.client.delete.mockRejectedValue(error);

            // Act & Assert
            await expect(clientRepository.delete(1)).rejects.toThrow('Database error');
            expect(mockPrismaClient.client.delete).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error deleting client: ${error.message}`
            );
        });
    });

    // Test cases for findByUserId
    describe('#findByUserId', () => {
        it('should return a client if found by user ID', async () => {
            // Arrange
            const mockClient: Client = {
                id: 1,
                name: 'Test Client',
                phone: '123-456-7890' as string | null,
                user_id: 1,
                created_at: new Date(),
                updated_at: new Date(),
            };
            mockPrismaClient.client.findUnique.mockResolvedValue(mockClient);

            // Act
            const result = await clientRepository.findByUserId(1);

            // Assert
            expect(result).toEqual(mockClient);
            expect(mockPrismaClient.client.findUnique).toHaveBeenCalledWith({ where: { user_id: 1 }, include: { user: true, appointments: true } });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should return null if client not found by user ID', async () => {
            // Arrange
            mockPrismaClient.client.findUnique.mockResolvedValue(null);

            // Act
            const result = await clientRepository.findByUserId(999);

            // Assert
            expect(result).toEqual(null);
            expect(mockPrismaClient.client.findUnique).toHaveBeenCalledWith({ where: { user_id: 999 }, include: { user: true, appointments: true } });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            // Arrange
            const error = new Error('Database error');
            mockPrismaClient.client.findUnique.mockRejectedValue(error);

            // Act & Assert
            await expect(clientRepository.findByUserId(1)).rejects.toThrow('Database error');
            expect(mockPrismaClient.client.findUnique).toHaveBeenCalledWith({ where: { user_id: 1 }, include: { user: true, appointments: true } });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error finding client by user ID: ${error.message}`
            );
        });
    });

    // Test cases for findAll
    describe('#findAll', () => {
        it('should return an array of all clients', async () => {
            // Arrange
            const mockClients: Client[] = [
                {
                    id: 1,
                    name: 'Client 1',
                    phone: '111-222-3333' as string | null,
                    user_id: 1,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: 2,
                    name: 'Client 2',
                    phone: '444-555-6666' as string | null,
                    user_id: 2,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ];
            mockPrismaClient.client.findMany.mockResolvedValue(mockClients);

            // Act
            const result = await clientRepository.findAll();

            // Assert
            expect(result).toEqual(mockClients);
            expect(mockPrismaClient.client.findMany).toHaveBeenCalledWith({ include: { user: true } });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should return an empty array if no clients found', async () => {
            // Arrange
            mockPrismaClient.client.findMany.mockResolvedValue([]);

            // Act
            const result = await clientRepository.findAll();

            // Assert
            expect(result).toEqual([]);
            expect(mockPrismaClient.client.findMany).toHaveBeenCalledWith({ include: { user: true } });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            // Arrange
            const error = new Error('Database error');
            mockPrismaClient.client.findMany.mockRejectedValue(error);

            // Act & Assert
            await expect(clientRepository.findAll()).rejects.toThrow('Database error');
            expect(mockPrismaClient.client.findMany).toHaveBeenCalledWith({ include: { user: true } });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error finding all clients: ${error.message}`
            );
        });
    });

    // Test cases for findByName
    describe('#findByName', () => {
        it('should return clients matching the name pattern', async () => {
            // Arrange
            const mockClients = [
                {
                    id: 1,
                    name: 'John Doe',
                    phone: '111-222-3333' as string | null,
                    user_id: 1,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: 2,
                    name: 'John Smith',
                    phone: '444-555-6666' as string | null,
                    user_id: 2,
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            ];
            mockPrismaClient.client.findMany.mockResolvedValue(mockClients);

            // Act
            const result = await clientRepository.findByName('John');

            // Assert
            expect(result).toEqual(mockClients);
            expect(mockPrismaClient.client.findMany).toHaveBeenCalledWith({
                where: {
                    name: {
                        contains: 'John',
                        mode: 'insensitive'
                    }
                },
                include: {
                    user: true
                }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should return an empty array if no clients match the name pattern', async () => {
            // Arrange
            mockPrismaClient.client.findMany.mockResolvedValue([]);

            // Act
            const result = await clientRepository.findByName('NonExistentName');

            // Assert
            expect(result).toEqual([]);
            expect(mockPrismaClient.client.findMany).toHaveBeenCalledWith({
                where: {
                    name: {
                        contains: 'NonExistentName',
                        mode: 'insensitive'
                    }
                },
                include: {
                    user: true
                }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            // Arrange
            const error = new Error('Database error');
            mockPrismaClient.client.findMany.mockRejectedValue(error);

            // Act & Assert
            await expect(clientRepository.findByName('John')).rejects.toThrow('Database error');
            expect(mockPrismaClient.client.findMany).toHaveBeenCalledWith({
                where: {
                    name: {
                        contains: 'John',
                        mode: 'insensitive'
                    }
                },
                include: {
                    user: true
                }
            });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error finding clients by name: ${error.message}`
            );
        });
    });

    // Test cases for getAppointmentHistory
    describe('#getAppointmentHistory', () => {
        it('should return appointment history for a client', async () => {
            // Arrange
            const mockAppointments = [
                { 
                    id: 1, 
                    datetime: new Date(), 
                    client_id: 1, 
                    professional_id: 1,
                    service_id: 1,
                    status: 'confirmed',
                    created_at: new Date(),
                    updated_at: new Date(),
                    professional: { id: 1, name: 'Dr. Smith' },
                    service: { id: 1, name: 'Consultation' }
                },
                { 
                    id: 2, 
                    datetime: new Date(), 
                    client_id: 1, 
                    professional_id: 2,
                    service_id: 2,
                    status: 'completed',
                    created_at: new Date(),
                    updated_at: new Date(),
                    professional: { id: 2, name: 'Dr. Jones' },
                    service: { id: 2, name: 'Follow-up' }
                }
            ];
            mockPrismaClient.appointment.findMany.mockResolvedValue(mockAppointments);

            // Act
            const result = await clientRepository.getAppointmentHistory(1);

            // Assert
            expect(result).toEqual(mockAppointments);
            expect(mockPrismaClient.appointment.findMany).toHaveBeenCalledWith({
                where: {
                    client_id: 1
                },
                include: {
                    professional: true,
                    service: true
                },
                orderBy: {
                    datetime: 'desc'
                }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should return an empty array if client has no appointments', async () => {
            // Arrange
            mockPrismaClient.appointment.findMany.mockResolvedValue([]);

            // Act
            const result = await clientRepository.getAppointmentHistory(999);

            // Assert
            expect(result).toEqual([]);
            expect(mockPrismaClient.appointment.findMany).toHaveBeenCalledWith({
                where: {
                    client_id: 999
                },
                include: {
                    professional: true,
                    service: true
                },
                orderBy: {
                    datetime: 'desc'
                }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            // Arrange
            const error = new Error('Database error');
            mockPrismaClient.appointment.findMany.mockRejectedValue(error);

            // Act & Assert
            await expect(clientRepository.getAppointmentHistory(1)).rejects.toThrow('Database error');
            expect(mockPrismaClient.appointment.findMany).toHaveBeenCalledWith({
                where: {
                    client_id: 1
                },
                include: {
                    professional: true,
                    service: true
                },
                orderBy: {
                    datetime: 'desc'
                }
            });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error getting client appointment history: ${error.message}`
            );
        });
    });
});
