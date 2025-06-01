// Mock dependencies first before imports
jest.mock('../../../../src/utils/logger');
jest.mock('../../../../src/infra/db/prisma', () => ({
    prisma: {}
}));

// Define custom types for testing purposes
interface TestUser {
    id: number;
    name: string;
    email?: string; // Make email optional for tests
    password?: string;
    role?: string; // Make role optional for tests
    created_at?: Date;
    updated_at?: Date;
    user_id?: number; // Some tests might use user_id instead of id
    [key: string]: any; // Allow for additional properties
}

interface TestProfessional {
    id: number;
    name: string;
    specialty?: string; // Make specialty optional for tests
    userId?: number;
    user_id?: number; // Some tests might use user_id instead of userId
    [key: string]: any; // Allow for additional properties
}

interface TestAvailability {
    time: string;
    available: boolean;
    [key: string]: any; // Allow for additional properties
}

// Define interfaces for input types
interface CreateProfessionalInput {
    name: string;
    specialty: string;
    userId?: number;
    [key: string]: any;
}

interface UpdateProfessionalInput {
    name?: string;
    specialty?: string;
    [key: string]: any;
}

interface UpdateUserInput {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    [key: string]: any;
}

// Define function types for repository methods
type ProfessionalFindAllFn = () => Promise<TestProfessional[]>;
type ProfessionalFindByIdFn = (id: number) => Promise<TestProfessional | null>;
type ProfessionalFindBySpecialtyFn = (specialty: string) => Promise<TestProfessional[]>;
type ProfessionalFindByUserIdFn = (userId: number) => Promise<TestProfessional | null>;
type ProfessionalGetAvailabilityFn = (professionalId: number, date: string, serviceId: number) => Promise<TestAvailability[]>;
type ProfessionalCreateFn = (data: CreateProfessionalInput) => Promise<TestProfessional>;
type ProfessionalUpdateFn = (id: number, data: UpdateProfessionalInput) => Promise<TestProfessional>;

type UserFindByIdFn = (id: number) => Promise<TestUser | null>;
type UserUpdateFn = (id: number, data: UpdateUserInput) => Promise<TestUser>;

// Create mock repositories with typed mock functions
const mockProfessionalRepository = {
    findAll: jest.fn() as jest.MockedFunction<ProfessionalFindAllFn>,
    findById: jest.fn() as jest.MockedFunction<ProfessionalFindByIdFn>,
    findBySpecialty: jest.fn() as jest.MockedFunction<ProfessionalFindBySpecialtyFn>,
    findByUserId: jest.fn() as jest.MockedFunction<ProfessionalFindByUserIdFn>,
    getAvailability: jest.fn() as jest.MockedFunction<ProfessionalGetAvailabilityFn>,
    create: jest.fn() as jest.MockedFunction<ProfessionalCreateFn>,
    update: jest.fn() as jest.MockedFunction<ProfessionalUpdateFn>
};

const mockUserRepository = {
    findById: jest.fn() as jest.MockedFunction<UserFindByIdFn>,
    update: jest.fn() as jest.MockedFunction<UserUpdateFn>
};

// Mock the repository modules
jest.mock('../../../../src/infra/repositories/prisma/ProfessionalRepository', () => ({
    ProfessionalRepository: jest.fn().mockImplementation(() => mockProfessionalRepository)
}));

jest.mock('../../../../src/infra/repositories/prisma/UserRepository', () => ({
    UserRepository: jest.fn().mockImplementation(() => mockUserRepository)
}));

import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Request, Response } from 'express';
import {
    createProfessional,
    getAllProfessionals,
    getProfessionalAvailability,
    getProfessionalById,
    updateProfessional
} from '../../../../src/infra/http/controllers/professionalController';

describe('ProfessionalController', () => {
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

    describe('getAllProfessionals', () => {
        it('should return all professionals with pagination', async () => {
            const mockProfessionals = [
                { id: 1, name: 'Dr. Smith', specialty: 'Cardiology' },
                { id: 2, name: 'Dr. Johnson', specialty: 'Dermatology' }
            ];

            mockRequest.query = { page: '1', limit: '10' };
            mockProfessionalRepository.findAll.mockResolvedValue(mockProfessionals);

            await getAllProfessionals(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockProfessionals,
                pagination: {
                    total: 2,
                    page: 1,
                    limit: 10,
                    pages: 1
                }
            });
        });

        it('should filter professionals by specialty', async () => {
            const mockProfessionals = [
                { id: 1, name: 'Dr. Smith', specialty: 'Cardiology' }
            ];

            mockRequest.query = { specialty: 'Cardiology' };
            mockProfessionalRepository.findBySpecialty.mockResolvedValue(mockProfessionals);

            await getAllProfessionals(mockRequest as Request, mockResponse as Response);

            expect(mockProfessionalRepository.findBySpecialty).toHaveBeenCalledWith('Cardiology');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockProfessionals,
                pagination: {
                    total: 1,
                    page: 1,
                    limit: 10,
                    pages: 1
                }
            });
        });

        it('should handle pagination correctly', async () => {
            const mockProfessionals = Array.from({ length: 15 }, (_, i) => ({
                id: i + 1,
                name: `Dr. ${i + 1}`,
                specialty: 'General'
            }));

            mockRequest.query = { page: '2', limit: '5' };
            mockProfessionalRepository.findAll.mockResolvedValue(mockProfessionals);

            await getAllProfessionals(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockProfessionals.slice(5, 10), // Page 2, items 6-10
                pagination: {
                    total: 15,
                    page: 2,
                    limit: 5,
                    pages: 3
                }
            });
        });

        it('should handle errors gracefully', async () => {
            mockProfessionalRepository.findAll.mockRejectedValue(new Error('Database error'));

            await getAllProfessionals(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Internal server error'
            });
        });
    });

    describe('getProfessionalById', () => {
        it('should return professional by valid ID', async () => {
            const mockProfessional = {
                id: 1,
                name: 'Dr. Smith',
                specialty: 'Cardiology'
            };

            mockRequest.params = { id: '1' };
            mockProfessionalRepository.findById.mockResolvedValue(mockProfessional);

            await getProfessionalById(mockRequest as Request, mockResponse as Response);

            expect(mockProfessionalRepository.findById).toHaveBeenCalledWith(1);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockProfessional
            });
        });

        it('should return 400 for invalid ID', async () => {
            mockRequest.params = { id: 'invalid' };

            await getProfessionalById(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid professional ID'
            });
        });

        it('should return 404 when professional not found', async () => {
            mockRequest.params = { id: '999' };
            mockProfessionalRepository.findById.mockResolvedValue(null);

            await getProfessionalById(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Profesional no encontrado'
            });
        });

        it('should handle errors gracefully', async () => {
            mockRequest.params = { id: '1' };
            mockProfessionalRepository.findById.mockRejectedValue(new Error('Database error'));

            await getProfessionalById(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Internal server error'
            });
        });
    });

    describe('getProfessionalAvailability', () => {
        it('should return availability for valid professional and date', async () => {
            const mockAvailability = [
                { time: '09:00', available: true },
                { time: '10:00', available: true }
            ];

            mockRequest.params = { id: '1' };
            mockRequest.query = { date: '2025-06-15', service_id: '1' };

            const mockProfessional = { id: 1, name: 'Dr. Smith' };
            mockProfessionalRepository.findById.mockResolvedValue(mockProfessional);
            mockProfessionalRepository.getAvailability.mockResolvedValue(mockAvailability);

            await getProfessionalAvailability(mockRequest as Request, mockResponse as Response);

            expect(mockProfessionalRepository.findById).toHaveBeenCalledWith(1);
            expect(mockProfessionalRepository.getAvailability).toHaveBeenCalledWith(1, new Date('2025-06-15'));
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockAvailability
            });
        });

        it('should return 400 for invalid professional ID', async () => {
            mockRequest.params = { id: 'invalid' };
            mockRequest.query = { date: '2025-06-15', service_id: '1' };

            await getProfessionalAvailability(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid professional ID'
            });
        });

        it('should return 400 when date is missing', async () => {
            mockRequest.params = { id: '1' };
            mockRequest.query = { service_id: '1' };

            await getProfessionalAvailability(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Date is required'
            });
        });

        it('should return 400 for invalid service ID', async () => {
            mockRequest.params = { id: '1' };
            mockRequest.query = { date: '2025-06-15', service_id: 'invalid' };

            await getProfessionalAvailability(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid service ID'
            });
        });

        it('should return 404 when professional not found', async () => {
            mockRequest.params = { id: '999' };
            mockRequest.query = { date: '2025-06-15', service_id: '1' };

            mockProfessionalRepository.findById.mockResolvedValue(null);

            await getProfessionalAvailability(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Profesional no encontrado'
            });
        });
    });

    describe('createProfessional', () => {
        it('should create professional successfully', async () => {
            const professionalData = {
                name: 'Dr. Smith',
                specialty: 'Cardiology',
                user_id: 1
            };

            const mockUser = { id: 1, name: 'John Smith', role: 'client' };
            const mockNewProfessional = { id: 1, ...professionalData };

            mockRequest.body = professionalData;
            mockUserRepository.findById.mockResolvedValue(mockUser);
            mockProfessionalRepository.findByUserId.mockResolvedValue(null);
            mockProfessionalRepository.create.mockResolvedValue(mockNewProfessional);
            mockUserRepository.update.mockResolvedValue({ ...mockUser, role: 'professional' });

            await createProfessional(mockRequest as Request, mockResponse as Response);

            expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
            expect(mockProfessionalRepository.findByUserId).toHaveBeenCalledWith(1);
            expect(mockProfessionalRepository.create).toHaveBeenCalledWith(professionalData);
            expect(mockUserRepository.update).toHaveBeenCalledWith(1, { role: 'professional' });
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockNewProfessional,
                message: 'Professional created successfully'
            });
        });

        it('should return 400 when required fields are missing', async () => {
            mockRequest.body = { specialty: 'Cardiology' }; // Missing name and user_id

            await createProfessional(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Name and user ID are required'
            });
        });

        it('should return 404 when user not found', async () => {
            mockRequest.body = {
                name: 'Dr. Smith',
                specialty: 'Cardiology',
                user_id: 999
            };

            mockUserRepository.findById.mockResolvedValue(null);

            await createProfessional(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'User not found'
            });
        });

        it('should return 409 when user already has professional profile', async () => {
            const professionalData = {
                name: 'Dr. Smith',
                specialty: 'Cardiology',
                user_id: 1
            };

            const mockUser = { id: 1, name: 'John Smith', role: 'client' };
            const existingProfessional = { id: 1, user_id: 1, name: 'Dr. Smith' };

            mockRequest.body = professionalData;
            mockUserRepository.findById.mockResolvedValue(mockUser);
            mockProfessionalRepository.findByUserId.mockResolvedValue(existingProfessional);

            await createProfessional(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(409);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'User is already associated with a professional'
            });
        });

        it('should not update role if user is already professional', async () => {
            const professionalData = {
                name: 'Dr. Smith',
                specialty: 'Cardiology',
                user_id: 1
            };

            const mockUser = { id: 1, name: 'John Smith', role: 'professional' };
            const mockNewProfessional = { id: 1, ...professionalData };

            mockRequest.body = professionalData;
            mockUserRepository.findById.mockResolvedValue(mockUser);
            mockProfessionalRepository.findByUserId.mockResolvedValue(null);
            mockProfessionalRepository.create.mockResolvedValue(mockNewProfessional);

            await createProfessional(mockRequest as Request, mockResponse as Response);

            expect(mockUserRepository.update).not.toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(201);
        });
    });

    describe('updateProfessional', () => {
        it('should update professional successfully', async () => {
            const updateData = {
                name: 'Dr. Smith Updated',
                specialty: 'Advanced Cardiology'
            };

            const mockProfessional = { id: 1, name: 'Dr. Smith', specialty: 'Cardiology' };
            const mockUpdatedProfessional = { ...mockProfessional, ...updateData };

            mockRequest.params = { id: '1' };
            mockRequest.body = updateData;
            mockProfessionalRepository.findById.mockResolvedValue(mockProfessional);
            mockProfessionalRepository.update.mockResolvedValue(mockUpdatedProfessional);

            await updateProfessional(mockRequest as Request, mockResponse as Response);

            expect(mockProfessionalRepository.findById).toHaveBeenCalledWith(1);
            expect(mockProfessionalRepository.update).toHaveBeenCalledWith(1, updateData);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockUpdatedProfessional,
                message: 'Professional updated successfully'
            });
        });

        it('should return 400 for invalid professional ID', async () => {
            mockRequest.params = { id: 'invalid' };
            mockRequest.body = { name: 'Dr. Smith' };

            await updateProfessional(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid professional ID'
            });
        });

        it('should return 400 when no update data provided', async () => {
            mockRequest.params = { id: '1' };
            mockRequest.body = {};

            await updateProfessional(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'No data provided for update'
            });
        });

        it('should return 404 when professional not found', async () => {
            mockRequest.params = { id: '999' };
            mockRequest.body = { name: 'Dr. Smith' };
            mockProfessionalRepository.findById.mockResolvedValue(null);

            await updateProfessional(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Profesional no encontrado'
            });
        });

        it('should handle partial updates', async () => {
            const mockProfessional = { id: 1, name: 'Dr. Smith', specialty: 'Cardiology' };
            const mockUpdatedProfessional = { ...mockProfessional, name: 'Dr. Smith Updated' };

            mockRequest.params = { id: '1' };
            mockRequest.body = { name: 'Dr. Smith Updated' }; // Only name update
            mockProfessionalRepository.findById.mockResolvedValue(mockProfessional);
            mockProfessionalRepository.update.mockResolvedValue(mockUpdatedProfessional);

            await updateProfessional(mockRequest as Request, mockResponse as Response);

            expect(mockProfessionalRepository.update).toHaveBeenCalledWith(1, { name: 'Dr. Smith Updated', specialty: undefined });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
        });

        it('should handle errors gracefully', async () => {
            mockRequest.params = { id: '1' };
            mockRequest.body = { name: 'Dr. Smith' };
            mockProfessionalRepository.findById.mockRejectedValue(new Error('Database error'));

            await updateProfessional(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Internal server error'
            });
        });
    });
});
