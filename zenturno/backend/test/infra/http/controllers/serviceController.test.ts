import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Request, Response } from 'express';

// Mock dependencies first before imports
const mockServiceRepository = {
    findAll: jest.fn() as jest.MockedFunction<any>,
    findById: jest.fn() as jest.MockedFunction<any>,
    findByName: jest.fn() as jest.MockedFunction<any>,
    create: jest.fn() as jest.MockedFunction<any>,
    update: jest.fn() as jest.MockedFunction<any>
};

// Mock the repository modules before importing controllers
jest.mock('../../../../src/infra/repositories/prisma/ServiceRepository', () => ({
    ServiceRepository: jest.fn(() => mockServiceRepository)
}));

jest.mock('../../../../src/utils/logger');

// Now import the controllers
import {
    createService,
    getAllServices,
    getServiceById,
    updateService
} from '../../../../src/infra/http/controllers/serviceController';

describe('ServiceController', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        jest.clearAllMocks();

        mockRequest = {
            body: {},
            query: {},
            params: {}
        };

        mockResponse = {
            status: jest.fn().mockReturnThis() as any,
            json: jest.fn().mockReturnThis() as any
        };
    });

    describe('getAllServices', () => {
        it('should return all services with pagination', async () => {
            const mockServices = [
                { id: 1, name: 'Consultation', price: 100, duration_minutes: 30 },
                { id: 2, name: 'Surgery', price: 500, duration_minutes: 120 }
            ];

            mockRequest.query = { page: '1', limit: '10' };
            mockServiceRepository.findAll.mockResolvedValue(mockServices);

            await getAllServices(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockServices,
                pagination: {
                    total: 2,
                    page: 1,
                    limit: 10,
                    pages: 1
                }
            });
        });

        it('should handle pagination correctly', async () => {
            const mockServices = Array.from({ length: 15 }, (_, i) => ({
                id: i + 1,
                name: `Service ${i + 1}`,
                price: 100,
                duration_minutes: 30
            }));

            mockRequest.query = { page: '2', limit: '5' };
            mockServiceRepository.findAll.mockResolvedValue(mockServices);

            await getAllServices(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockServices.slice(5, 10), // Page 2, items 6-10
                pagination: {
                    total: 15,
                    page: 2,
                    limit: 5,
                    pages: 3
                }
            });
        });

        it('should use default pagination when not provided', async () => {
            const mockServices = [
                { id: 1, name: 'Consultation', price: 100, duration_minutes: 30 }
            ];

            mockServiceRepository.findAll.mockResolvedValue(mockServices);

            await getAllServices(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockServices,
                pagination: {
                    total: 1,
                    page: 1,
                    limit: 10,
                    pages: 1
                }
            });
        });

        it('should handle errors gracefully', async () => {
            mockServiceRepository.findAll.mockRejectedValue(new Error('Database error'));

            await getAllServices(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Internal server error'
            });
        });
    });

    describe('getServiceById', () => {
        it('should return service by valid ID', async () => {
            const mockService = {
                id: 1,
                name: 'Consultation',
                price: 100,
                duration_minutes: 30
            };

            mockRequest.params = { id: '1' };
            mockServiceRepository.findById.mockResolvedValue(mockService);

            await getServiceById(mockRequest as Request, mockResponse as Response);

            expect(mockServiceRepository.findById).toHaveBeenCalledWith(1);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockService
            });
        });

        it('should return 400 for invalid ID', async () => {
            mockRequest.params = { id: 'invalid' };

            await getServiceById(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid service ID'
            });
        });

        it('should return 404 when service not found', async () => {
            mockRequest.params = { id: '999' };
            mockServiceRepository.findById.mockResolvedValue(null);

            await getServiceById(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Service not found'
            });
        });

        it('should handle errors gracefully', async () => {
            mockRequest.params = { id: '1' };
            mockServiceRepository.findById.mockRejectedValue(new Error('Database error'));

            await getServiceById(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Internal server error'
            });
        });
    });

    describe('createService', () => {
        it('should create service successfully', async () => {
            const serviceData = {
                name: 'New Consultation',
                price: 150,
                duration_minutes: 45
            };

            const mockNewService = { id: 1, ...serviceData };

            mockRequest.body = serviceData;
            mockServiceRepository.findByName.mockResolvedValue([]);
            mockServiceRepository.create.mockResolvedValue(mockNewService);

            await createService(mockRequest as Request, mockResponse as Response);

            expect(mockServiceRepository.findByName).toHaveBeenCalledWith('New Consultation');
            expect(mockServiceRepository.create).toHaveBeenCalledWith({
                name: 'New Consultation',
                price: 150,
                duration_minutes: 45
            });
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockNewService,
                message: 'Service created successfully'
            });
        });

        it('should return 400 when required fields are missing', async () => {
            mockRequest.body = { name: 'Consultation' }; // Missing price and duration_minutes

            await createService(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Name, price, and duration are required'
            });
        });

        it('should return 400 for invalid price', async () => {
            mockRequest.body = {
                name: 'Consultation',
                price: -50,
                duration_minutes: 30
            };

            await createService(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Price must be a positive number'
            });
        });

        it('should return 400 for invalid duration', async () => {
            mockRequest.body = {
                name: 'Consultation',
                price: 100,
                duration_minutes: -30
            };

            await createService(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Duration must be a positive number'
            });
        });

        it('should return 409 when service name already exists', async () => {
            const serviceData = {
                name: 'Existing Service',
                price: 100,
                duration_minutes: 30
            };

            const existingService = { id: 1, name: 'Existing Service', price: 100, duration_minutes: 30 };

            mockRequest.body = serviceData;
            mockServiceRepository.findByName.mockResolvedValue([existingService]);

            await createService(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(409);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'A service with this name already exists'
            });
        });

        it('should handle string prices and durations', async () => {
            const serviceData = {
                name: 'New Service',
                price: '150',
                duration_minutes: '45'
            };

            const mockNewService = { id: 1, name: 'New Service', price: 150, duration_minutes: 45 };

            mockRequest.body = serviceData;
            mockServiceRepository.findByName.mockResolvedValue([]);
            mockServiceRepository.create.mockResolvedValue(mockNewService);

            await createService(mockRequest as Request, mockResponse as Response);

            expect(mockServiceRepository.create).toHaveBeenCalledWith({
                name: 'New Service',
                price: 150,
                duration_minutes: 45
            });
            expect(mockResponse.status).toHaveBeenCalledWith(201);
        });

        it('should handle errors gracefully', async () => {
            mockRequest.body = {
                name: 'New Service',
                price: 100,
                duration_minutes: 30
            };

            mockServiceRepository.findByName.mockRejectedValue(new Error('Database error'));

            await createService(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Internal server error'
            });
        });
    });

    describe('updateService', () => {
        it('should update service successfully', async () => {
            const updateData = {
                name: 'Updated Consultation',
                price: 200,
                duration_minutes: 60
            };

            const mockService = { id: 1, name: 'Consultation', price: 100, duration_minutes: 30 };
            const mockUpdatedService = { ...mockService, ...updateData };

            mockRequest.params = { id: '1' };
            mockRequest.body = updateData;
            mockServiceRepository.findById.mockResolvedValue(mockService);
            mockServiceRepository.findByName.mockResolvedValue([]);
            mockServiceRepository.update.mockResolvedValue(mockUpdatedService);

            await updateService(mockRequest as Request, mockResponse as Response);

            expect(mockServiceRepository.findById).toHaveBeenCalledWith(1);
            expect(mockServiceRepository.update).toHaveBeenCalledWith(1, {
                name: 'Updated Consultation',
                price: 200,
                duration_minutes: 60
            });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockUpdatedService,
                message: 'Service updated successfully'
            });
        });

        it('should return 400 for invalid service ID', async () => {
            mockRequest.params = { id: 'invalid' };
            mockRequest.body = { name: 'Updated Service' };

            await updateService(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid service ID'
            });
        });

        it('should return 400 when no update data provided', async () => {
            mockRequest.params = { id: '1' };
            mockRequest.body = {};

            await updateService(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'No data provided for update'
            });
        });

        it('should return 404 when service not found', async () => {
            mockRequest.params = { id: '999' };
            mockRequest.body = { name: 'Updated Service' };
            mockServiceRepository.findById.mockResolvedValue(null);

            await updateService(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Service not found'
            });
        });

        it('should handle errors gracefully', async () => {
            mockRequest.params = { id: '1' };
            mockRequest.body = { name: 'Updated Service' };
            mockServiceRepository.findById.mockRejectedValue(new Error('Database error'));

            await updateService(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Internal server error'
            });
        });
    });
});
