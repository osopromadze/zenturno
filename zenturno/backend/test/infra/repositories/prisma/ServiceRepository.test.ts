import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PrismaClient, Service } from '@prisma/client';

// Mock the singleton prisma client and logger
type MockedPrismaClientService = {
    service: {
        findUnique: jest.Mock<typeof PrismaClient.prototype.service.findUnique>,
        create: jest.Mock<typeof PrismaClient.prototype.service.create>,
        update: jest.Mock<typeof PrismaClient.prototype.service.update>,
        delete: jest.Mock<typeof PrismaClient.prototype.service.delete>,
        findMany: jest.Mock<typeof PrismaClient.prototype.service.findMany>,
    };
};

const mockPrismaClient: MockedPrismaClientService = {
    service: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
    },
};

jest.doMock('../../../../src/infra/db/prisma', () => ({
    prisma: mockPrismaClient,
}));

const mockLogger = {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
};

jest.doMock('../../../../src/utils/logger', () => ({
    logger: mockLogger,
}));

import { CreateServiceInput, ServiceFilter, ServiceRepository, UpdateServiceInput } from '../../../../src/infra/repositories/prisma/ServiceRepository';

describe('ServiceRepository', () => {
    let serviceRepository: ServiceRepository;

    beforeEach(() => {
        serviceRepository = new ServiceRepository();
        jest.clearAllMocks();
    });

    // Test cases for findById
    describe('#findById', () => {
        it('should return a service if found', async () => {
            // Arrange
            const mockService: Service = {
                id: 1,
                name: 'Test Service',
                price: 100 as any,
                duration_minutes: 60,
                created_at: new Date(),
                updated_at: new Date(),
            };
            mockPrismaClient.service.findUnique.mockResolvedValue(mockService);

            // Act
            const result = await serviceRepository.findById(1);

            // Assert
            expect(result).toEqual(mockService);
            expect(mockPrismaClient.service.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: { appointments: true }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should return null if service not found', async () => {
            // Arrange
            mockPrismaClient.service.findUnique.mockResolvedValue(null);

            // Act
            const result = await serviceRepository.findById(999);

            // Assert
            expect(result).toEqual(null);
            expect(mockPrismaClient.service.findUnique).toHaveBeenCalledWith({
                where: { id: 999 },
                include: { appointments: true }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            // Arrange
            const error = new Error('Database error');
            mockPrismaClient.service.findUnique.mockRejectedValue(error);

            // Act & Assert
            await expect(serviceRepository.findById(1)).rejects.toThrow('Database error');
            expect(mockPrismaClient.service.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: { appointments: true }
            });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error finding service by ID: ${error.message}`
            );
        });
    });

    // Test cases for create
    describe('#create', () => {
        it('should create and return a new service', async () => {
            // Arrange
            const createData: CreateServiceInput = {
                name: 'New Service',
                price: 150 as any,
                duration_minutes: 90,
            };
            const mockNewService: Service = {
                id: 2,
                name: createData.name,
                price: createData.price as any,
                duration_minutes: createData.duration_minutes,
                created_at: new Date(),
                updated_at: new Date(),
            };
            mockPrismaClient.service.create.mockResolvedValue(mockNewService);

            // Act
            const result = await serviceRepository.create(createData);

            // Assert
            expect(result).toEqual(mockNewService);
            expect(mockPrismaClient.service.create).toHaveBeenCalledWith({
                data: {
                    name: createData.name,
                    price: createData.price,
                    duration_minutes: createData.duration_minutes
                }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            // Arrange
            const createData: CreateServiceInput = {
                name: 'New Service',
                price: 150 as any,
                duration_minutes: 90,
            };
            const error = new Error('Database error');
            mockPrismaClient.service.create.mockRejectedValue(error);

            // Act & Assert
            await expect(serviceRepository.create(createData)).rejects.toThrow('Database error');
            expect(mockPrismaClient.service.create).toHaveBeenCalledWith({
                data: {
                    name: createData.name,
                    price: createData.price,
                    duration_minutes: createData.duration_minutes
                }
            });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error creating service: ${error.message}`
            );
        });
    });

    // Test cases for update
    describe('#update', () => {
        it('should update and return the updated service', async () => {
            // Arrange
            const updateData: UpdateServiceInput = {
                name: 'Updated Service',
                price: 200 as any,
            };
            const mockUpdatedService: Service = {
                id: 1,
                name: 'Updated Service',
                price: 200 as any,
                duration_minutes: 60,
                created_at: new Date(),
                updated_at: new Date(),
            };
            mockPrismaClient.service.update.mockResolvedValue(mockUpdatedService);

            // Act
            const result = await serviceRepository.update(1, updateData);

            // Assert
            expect(result).toEqual(mockUpdatedService);
            expect(mockPrismaClient.service.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateData
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should update only provided fields', async () => {
            // Arrange
            const updateData: UpdateServiceInput = { name: 'Updated Name Only' };
            const mockUpdatedService: Service = {
                id: 1,
                name: 'Updated Name Only',
                price: 100 as any,
                duration_minutes: 60,
                created_at: new Date(),
                updated_at: new Date(),
            };
            mockPrismaClient.service.update.mockResolvedValue(mockUpdatedService);

            // Act
            const result = await serviceRepository.update(1, updateData);

            // Assert
            expect(result).toEqual(mockUpdatedService);
            expect(mockPrismaClient.service.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateData
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if service not found for update', async () => {
            // Arrange
            const updateData: UpdateServiceInput = { name: 'Nonexistent Service' };
            const error = new Error('Service not found');
            mockPrismaClient.service.update.mockRejectedValue(error);

            // Act & Assert
            await expect(serviceRepository.update(999, updateData)).rejects.toThrow('Service not found');
            expect(mockPrismaClient.service.update).toHaveBeenCalledWith({
                where: { id: 999 },
                data: updateData
            });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error updating service: ${error.message}`
            );
        });

        it('should throw an error if prisma call fails', async () => {
            // Arrange
            const updateData: UpdateServiceInput = { name: 'Updated Service' };
            const error = new Error('Database error');
            mockPrismaClient.service.update.mockRejectedValue(error);

            // Act & Assert
            await expect(serviceRepository.update(1, updateData)).rejects.toThrow('Database error');
            expect(mockPrismaClient.service.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateData
            });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error updating service: ${error.message}`
            );
        });
    });

    // Test cases for delete
    describe('#delete', () => {
        it('should delete and return the deleted service', async () => {
            // Arrange
            const mockDeletedService: Service = {
                id: 1,
                name: 'Deleted Service',
                price: 100 as any,
                duration_minutes: 60,
                created_at: new Date(),
                updated_at: new Date(),
            };
            mockPrismaClient.service.delete.mockResolvedValue(mockDeletedService);

            // Act
            const result = await serviceRepository.delete(1);

            // Assert
            expect(result).toEqual(mockDeletedService);
            expect(mockPrismaClient.service.delete).toHaveBeenCalledWith({
                where: { id: 1 }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if service not found for delete', async () => {
            // Arrange
            const error = new Error('Service not found');
            mockPrismaClient.service.delete.mockRejectedValue(error);

            // Act & Assert
            await expect(serviceRepository.delete(999)).rejects.toThrow('Service not found');
            expect(mockPrismaClient.service.delete).toHaveBeenCalledWith({
                where: { id: 999 }
            });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error deleting service: ${error.message}`
            );
        });

        it('should throw an error if prisma call fails', async () => {
            // Arrange
            const error = new Error('Database error');
            mockPrismaClient.service.delete.mockRejectedValue(error);

            // Act & Assert
            await expect(serviceRepository.delete(1)).rejects.toThrow('Database error');
            expect(mockPrismaClient.service.delete).toHaveBeenCalledWith({
                where: { id: 1 }
            });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error deleting service: ${error.message}`
            );
        });
    });

    // Test cases for findAll
    describe('#findAll', () => {
        it('should return an array of all services', async () => {
            // Arrange
            const mockServices: Service[] = [
                {
                    id: 1,
                    name: 'Service 1',
                    price: 100 as any,
                    duration_minutes: 60,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: 2,
                    name: 'Service 2',
                    price: 150 as any,
                    duration_minutes: 90,
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            ];
            mockPrismaClient.service.findMany.mockResolvedValue(mockServices);

            // Act
            const result = await serviceRepository.findAll();

            // Assert
            expect(result).toEqual(mockServices);
            expect(mockPrismaClient.service.findMany).toHaveBeenCalledWith({
                orderBy: {
                    name: 'asc'
                }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should return an empty array if no services found', async () => {
            // Arrange
            mockPrismaClient.service.findMany.mockResolvedValue([]);

            // Act
            const result = await serviceRepository.findAll();

            // Assert
            expect(result).toEqual([]);
            expect(mockPrismaClient.service.findMany).toHaveBeenCalledWith({
                orderBy: {
                    name: 'asc'
                }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            // Arrange
            const error = new Error('Database error');
            mockPrismaClient.service.findMany.mockRejectedValue(error);

            // Act & Assert
            await expect(serviceRepository.findAll()).rejects.toThrow('Database error');
            expect(mockPrismaClient.service.findMany).toHaveBeenCalledWith({
                orderBy: {
                    name: 'asc'
                }
            });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error finding all services: ${error.message}`
            );
        });
    });

    // Test cases for findByName
    describe('#findByName', () => {
        it('should return services matching the name pattern', async () => {
            // Arrange
            const mockServices: Service[] = [
                {
                    id: 1,
                    name: 'Massage Therapy',
                    price: 100 as any,
                    duration_minutes: 60,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: 2,
                    name: 'Deep Tissue Massage',
                    price: 150 as any,
                    duration_minutes: 90,
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            ];
            mockPrismaClient.service.findMany.mockResolvedValue(mockServices);

            // Act
            const result = await serviceRepository.findByName('massage');

            // Assert
            expect(result).toEqual(mockServices);
            expect(mockPrismaClient.service.findMany).toHaveBeenCalledWith({
                where: {
                    name: {
                        contains: 'massage',
                        mode: 'insensitive'
                    }
                },
                orderBy: {
                    name: 'asc'
                }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should return an empty array if no services match the name pattern', async () => {
            // Arrange
            mockPrismaClient.service.findMany.mockResolvedValue([]);

            // Act
            const result = await serviceRepository.findByName('nonexistent');

            // Assert
            expect(result).toEqual([]);
            expect(mockPrismaClient.service.findMany).toHaveBeenCalledWith({
                where: {
                    name: {
                        contains: 'nonexistent',
                        mode: 'insensitive'
                    }
                },
                orderBy: {
                    name: 'asc'
                }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            // Arrange
            const error = new Error('Database error');
            mockPrismaClient.service.findMany.mockRejectedValue(error);

            // Act & Assert
            await expect(serviceRepository.findByName('massage')).rejects.toThrow('Database error');
            expect(mockPrismaClient.service.findMany).toHaveBeenCalledWith({
                where: {
                    name: {
                        contains: 'massage',
                        mode: 'insensitive'
                    }
                },
                orderBy: {
                    name: 'asc'
                }
            });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error finding services by name: ${error.message}`
            );
        });
    });

    // Test cases for findByPriceRange
    describe('#findByPriceRange', () => {
        it('should return services within the specified price range', async () => {
            // Arrange
            const mockServices: Service[] = [
                {
                    id: 1,
                    name: 'Service 1',
                    price: 100 as any,
                    duration_minutes: 60,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: 2,
                    name: 'Service 2',
                    price: 150 as any,
                    duration_minutes: 90,
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            ];
            mockPrismaClient.service.findMany.mockResolvedValue(mockServices);

            // Act
            const result = await serviceRepository.findByPriceRange(100, 200);

            // Assert
            expect(result).toEqual(mockServices);
            expect(mockPrismaClient.service.findMany).toHaveBeenCalledWith({
                where: {
                    price: {
                        gte: 100,
                        lte: 200
                    }
                },
                orderBy: {
                    price: 'asc'
                }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should return an empty array if no services match the price range', async () => {
            // Arrange
            mockPrismaClient.service.findMany.mockResolvedValue([]);

            // Act
            const result = await serviceRepository.findByPriceRange(1000, 2000);

            // Assert
            expect(result).toEqual([]);
            expect(mockPrismaClient.service.findMany).toHaveBeenCalledWith({
                where: {
                    price: {
                        gte: 1000,
                        lte: 2000
                    }
                },
                orderBy: {
                    price: 'asc'
                }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            // Arrange
            const error = new Error('Database error');
            mockPrismaClient.service.findMany.mockRejectedValue(error);

            // Act & Assert
            await expect(serviceRepository.findByPriceRange(100, 200)).rejects.toThrow('Database error');
            expect(mockPrismaClient.service.findMany).toHaveBeenCalledWith({
                where: {
                    price: {
                        gte: 100,
                        lte: 200
                    }
                },
                orderBy: {
                    price: 'asc'
                }
            });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error finding services by price range: ${error.message}`
            );
        });
    });

    // Test cases for findByDurationRange
    describe('#findByDurationRange', () => {
        it('should return services within the specified duration range', async () => {
            // Arrange
            const mockServices: Service[] = [
                {
                    id: 1,
                    name: 'Service 1',
                    price: 100 as any,
                    duration_minutes: 60,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: 2,
                    name: 'Service 2',
                    price: 150 as any,
                    duration_minutes: 90,
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            ];
            mockPrismaClient.service.findMany.mockResolvedValue(mockServices);

            // Act
            const result = await serviceRepository.findByDurationRange(60, 120);

            // Assert
            expect(result).toEqual(mockServices);
            expect(mockPrismaClient.service.findMany).toHaveBeenCalledWith({
                where: {
                    duration_minutes: {
                        gte: 60,
                        lte: 120
                    }
                },
                orderBy: {
                    duration_minutes: 'asc'
                }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should return an empty array if no services match the duration range', async () => {
            // Arrange
            mockPrismaClient.service.findMany.mockResolvedValue([]);

            // Act
            const result = await serviceRepository.findByDurationRange(300, 400);

            // Assert
            expect(result).toEqual([]);
            expect(mockPrismaClient.service.findMany).toHaveBeenCalledWith({
                where: {
                    duration_minutes: {
                        gte: 300,
                        lte: 400
                    }
                },
                orderBy: {
                    duration_minutes: 'asc'
                }
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            // Arrange
            const error = new Error('Database error');
            mockPrismaClient.service.findMany.mockRejectedValue(error);

            // Act & Assert
            await expect(serviceRepository.findByDurationRange(60, 120)).rejects.toThrow('Database error');
            expect(mockPrismaClient.service.findMany).toHaveBeenCalledWith({
                where: {
                    duration_minutes: {
                        gte: 60,
                        lte: 120
                    }
                },
                orderBy: {
                    duration_minutes: 'asc'
                }
            });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error finding services by duration range: ${error.message}`
            );
        });
    });

    // Test cases for findWithFilters
    describe('#findWithFilters', () => {
        it('should return services with all filters applied', async () => {
            // Arrange
            const filters: ServiceFilter = {
                minPrice: 100,
                maxPrice: 200,
                minDuration: 60,
                maxDuration: 120
            };
            const mockServices: Service[] = [
                {
                    id: 1,
                    name: 'Service 1',
                    price: 150 as any,
                    duration_minutes: 90,
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            ];
            mockPrismaClient.service.findMany.mockResolvedValue(mockServices);

            // Act
            const result = await serviceRepository.findWithFilters(filters);

            // Assert
            expect(result).toEqual(mockServices);
            expect(mockPrismaClient.service.findMany).toHaveBeenCalledWith({
                where: {
                    price: {
                        gte: 100,
                        lte: 200
                    },
                    duration_minutes: {
                        gte: 60,
                        lte: 120
                    }
                },
                orderBy: [
                    { price: 'asc' },
                    { name: 'asc' }
                ]
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should apply only price filters when duration filters are not provided', async () => {
            // Arrange
            const filters: ServiceFilter = {
                minPrice: 100,
                maxPrice: 200
            };
            const mockServices: Service[] = [
                {
                    id: 1,
                    name: 'Service 1',
                    price: 150 as any,
                    duration_minutes: 60,
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            ];
            mockPrismaClient.service.findMany.mockResolvedValue(mockServices);

            // Act
            const result = await serviceRepository.findWithFilters(filters);

            // Assert
            expect(result).toEqual(mockServices);
            expect(mockPrismaClient.service.findMany).toHaveBeenCalledWith({
                where: {
                    price: {
                        gte: 100,
                        lte: 200
                    }
                },
                orderBy: [
                    { price: 'asc' },
                    { name: 'asc' }
                ]
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should apply only duration filters when price filters are not provided', async () => {
            // Arrange
            const filters: ServiceFilter = {
                minDuration: 60,
                maxDuration: 120
            };
            const mockServices: Service[] = [
                {
                    id: 1,
                    name: 'Service 1',
                    price: 100 as any,
                    duration_minutes: 90,
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            ];
            mockPrismaClient.service.findMany.mockResolvedValue(mockServices);

            // Act
            const result = await serviceRepository.findWithFilters(filters);

            // Assert
            expect(result).toEqual(mockServices);
            expect(mockPrismaClient.service.findMany).toHaveBeenCalledWith({
                where: {
                    duration_minutes: {
                        gte: 60,
                        lte: 120
                    }
                },
                orderBy: [
                    { price: 'asc' },
                    { name: 'asc' }
                ]
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should apply partial price filters (only min)', async () => {
            // Arrange
            const filters: ServiceFilter = {
                minPrice: 100
            };
            const mockServices: Service[] = [
                {
                    id: 1,
                    name: 'Service 1',
                    price: 150 as any,
                    duration_minutes: 60,
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            ];
            mockPrismaClient.service.findMany.mockResolvedValue(mockServices);

            // Act
            const result = await serviceRepository.findWithFilters(filters);

            // Assert
            expect(result).toEqual(mockServices);
            expect(mockPrismaClient.service.findMany).toHaveBeenCalledWith({
                where: {
                    price: {
                        gte: 100
                    }
                },
                orderBy: [
                    { price: 'asc' },
                    { name: 'asc' }
                ]
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should apply partial price filters (only max)', async () => {
            // Arrange
            const filters: ServiceFilter = {
                maxPrice: 200
            };
            const mockServices: Service[] = [
                {
                    id: 1,
                    name: 'Service 1',
                    price: 150 as any,
                    duration_minutes: 60,
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            ];
            mockPrismaClient.service.findMany.mockResolvedValue(mockServices);

            // Act
            const result = await serviceRepository.findWithFilters(filters);

            // Assert
            expect(result).toEqual(mockServices);
            expect(mockPrismaClient.service.findMany).toHaveBeenCalledWith({
                where: {
                    price: {
                        lte: 200
                    }
                },
                orderBy: [
                    { price: 'asc' },
                    { name: 'asc' }
                ]
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should apply partial duration filters (only min)', async () => {
            // Arrange
            const filters: ServiceFilter = {
                minDuration: 60
            };
            const mockServices: Service[] = [
                {
                    id: 1,
                    name: 'Service 1',
                    price: 100 as any,
                    duration_minutes: 90,
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            ];
            mockPrismaClient.service.findMany.mockResolvedValue(mockServices);

            // Act
            const result = await serviceRepository.findWithFilters(filters);

            // Assert
            expect(result).toEqual(mockServices);
            expect(mockPrismaClient.service.findMany).toHaveBeenCalledWith({
                where: {
                    duration_minutes: {
                        gte: 60
                    }
                },
                orderBy: [
                    { price: 'asc' },
                    { name: 'asc' }
                ]
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should apply partial duration filters (only max)', async () => {
            // Arrange
            const filters: ServiceFilter = {
                maxDuration: 120
            };
            const mockServices: Service[] = [
                {
                    id: 1,
                    name: 'Service 1',
                    price: 100 as any,
                    duration_minutes: 90,
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            ];
            mockPrismaClient.service.findMany.mockResolvedValue(mockServices);

            // Act
            const result = await serviceRepository.findWithFilters(filters);

            // Assert
            expect(result).toEqual(mockServices);
            expect(mockPrismaClient.service.findMany).toHaveBeenCalledWith({
                where: {
                    duration_minutes: {
                        lte: 120
                    }
                },
                orderBy: [
                    { price: 'asc' },
                    { name: 'asc' }
                ]
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should return all services when no filters are provided', async () => {
            // Arrange
            const filters: ServiceFilter = {};
            const mockServices: Service[] = [
                {
                    id: 1,
                    name: 'Service 1',
                    price: 100 as any,
                    duration_minutes: 60,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: 2,
                    name: 'Service 2',
                    price: 150 as any,
                    duration_minutes: 90,
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            ];
            mockPrismaClient.service.findMany.mockResolvedValue(mockServices);

            // Act
            const result = await serviceRepository.findWithFilters(filters);

            // Assert
            expect(result).toEqual(mockServices);
            expect(mockPrismaClient.service.findMany).toHaveBeenCalledWith({
                where: {},
                orderBy: [
                    { price: 'asc' },
                    { name: 'asc' }
                ]
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should return empty array if no services match filters', async () => {
            // Arrange
            const filters: ServiceFilter = {
                minPrice: 1000,
                maxPrice: 2000
            };
            mockPrismaClient.service.findMany.mockResolvedValue([]);

            // Act
            const result = await serviceRepository.findWithFilters(filters);

            // Assert
            expect(result).toEqual([]);
            expect(mockPrismaClient.service.findMany).toHaveBeenCalledWith({
                where: {
                    price: {
                        gte: 1000,
                        lte: 2000
                    }
                },
                orderBy: [
                    { price: 'asc' },
                    { name: 'asc' }
                ]
            });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an error if prisma call fails', async () => {
            // Arrange
            const filters: ServiceFilter = {
                minPrice: 100,
                maxPrice: 200
            };
            const error = new Error('Database error');
            mockPrismaClient.service.findMany.mockRejectedValue(error);

            // Act & Assert
            await expect(serviceRepository.findWithFilters(filters)).rejects.toThrow('Database error');
            expect(mockPrismaClient.service.findMany).toHaveBeenCalledWith({
                where: {
                    price: {
                        gte: 100,
                        lte: 200
                    }
                },
                orderBy: [
                    { price: 'asc' },
                    { name: 'asc' }
                ]
            });
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Error finding services with filters: ${error.message}`
            );
        });
    });
});
