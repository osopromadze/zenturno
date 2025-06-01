// Mock dependencies first before imports
jest.mock('../../../../src/utils/logger');
jest.mock('../../../../src/infra/db/prisma', () => ({
    prisma: {}
}));

// Define custom types for testing purposes
interface TestAppointment {
    id: number;
    datetime?: string;
    date?: string;
    time?: string;
    client_id?: number;
    professional_id?: number;
    service_id?: number;
    status?: string;
    [key: string]: any; // Allow for additional properties
}

interface TestClient {
    id: number;
    user_id?: number;
    name?: string;
    [key: string]: any; // Allow for additional properties
}

interface TestProfessional {
    id: number;
    name?: string;
    specialty?: string;
    user_id?: number;
    [key: string]: any; // Allow for additional properties
}

interface TestService {
    id: number;
    name?: string;
    price?: number;
    duration?: number;
    [key: string]: any; // Allow for additional properties
}

// Define interfaces for input types
interface CreateAppointmentInput {
    datetime: string;
    client_id: number;
    professional_id: number;
    service_id: number;
    [key: string]: any;
}

interface UpdateAppointmentInput {
    datetime?: string;
    status?: string;
    [key: string]: any;
}

// Define function types for repository methods
type AppointmentCreateFn = (data: CreateAppointmentInput) => Promise<TestAppointment>;
type AppointmentFindByClientIdFn = (clientId: number) => Promise<TestAppointment[]>;
type AppointmentFindByProfessionalIdFn = (professionalId: number) => Promise<TestAppointment[]>;
type AppointmentFindAllFn = () => Promise<TestAppointment[]>;
type AppointmentFindByIdFn = (id: number) => Promise<TestAppointment | null>;
type AppointmentUpdateFn = (id: number, data: UpdateAppointmentInput) => Promise<TestAppointment>;

type ClientFindByUserIdFn = (userId: number) => Promise<TestClient | null>;

type ProfessionalFindByIdFn = (id: number) => Promise<TestProfessional | null>;
type ProfessionalFindByUserIdFn = (userId: number) => Promise<TestProfessional | null>;
type ProfessionalGetAvailabilityFn = (professionalId: number, date: string, serviceId: number) => Promise<{time: string, available: boolean}[]>;

type ServiceFindByIdFn = (id: number) => Promise<TestService | null>;

// Create mock repositories with typed mock functions
const mockAppointmentRepository = {
    create: jest.fn() as jest.MockedFunction<AppointmentCreateFn>,
    findByClientId: jest.fn() as jest.MockedFunction<AppointmentFindByClientIdFn>,
    findByProfessionalId: jest.fn() as jest.MockedFunction<AppointmentFindByProfessionalIdFn>,
    findAll: jest.fn() as jest.MockedFunction<AppointmentFindAllFn>,
    findById: jest.fn() as jest.MockedFunction<AppointmentFindByIdFn>,
    update: jest.fn() as jest.MockedFunction<AppointmentUpdateFn>
};

const mockClientRepository = {
    findByUserId: jest.fn() as jest.MockedFunction<ClientFindByUserIdFn>
};

const mockProfessionalRepository = {
    findById: jest.fn() as jest.MockedFunction<ProfessionalFindByIdFn>,
    findByUserId: jest.fn() as jest.MockedFunction<ProfessionalFindByUserIdFn>,
    getAvailability: jest.fn() as jest.MockedFunction<ProfessionalGetAvailabilityFn>
};

const mockServiceRepository = {
    findById: jest.fn() as jest.MockedFunction<ServiceFindByIdFn>
};

// Mock the repository modules
jest.mock('../../../../src/infra/repositories/prisma/AppointmentRepository', () => ({
    AppointmentRepository: jest.fn().mockImplementation(() => mockAppointmentRepository)
}));

jest.mock('../../../../src/infra/repositories/prisma/ClientRepository', () => ({
    ClientRepository: jest.fn().mockImplementation(() => mockClientRepository)
}));

jest.mock('../../../../src/infra/repositories/prisma/ProfessionalRepository', () => ({
    ProfessionalRepository: jest.fn().mockImplementation(() => mockProfessionalRepository)
}));

jest.mock('../../../../src/infra/repositories/prisma/ServiceRepository', () => ({
    ServiceRepository: jest.fn().mockImplementation(() => mockServiceRepository)
}));

import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Request, Response } from 'express';
import {
    cancelAppointment,
    createAppointment,
    getAllAppointments,
    getAppointmentById,
    getMyAppointments
} from '../../../../src/infra/http/controllers/appointmentController';

// Custom Request type for testing
interface TestRequest extends Partial<Request> {
    user?: {
        id: number;
        email: string;
        rol: string;
    };
}

describe('AppointmentController', () => {
    let mockRequest: TestRequest;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        jest.clearAllMocks();

        mockRequest = {
            body: {},
            query: {},
            params: {},
            user: { id: 1, email: 'test@example.com', rol: 'CLIENT' }
        };

        mockResponse = {
            status: jest.fn().mockReturnThis() as any,
            json: jest.fn().mockReturnThis() as any
        };
    });

    describe('createAppointment', () => {
        it('should create appointment successfully', async () => {
            const appointmentData = {
                datetime: '2025-06-15T10:00:00Z',
                professional_id: 1,
                service_id: 1
            };

            const mockClient = { id: 1, user_id: 1 };
            const mockProfessional = { id: 1, name: 'Dr. Smith' };
            const mockService = { id: 1, name: 'Consultation' };
            const mockAppointment = { id: 1, ...appointmentData, client_id: 1, status: 'pending' };

            mockRequest.body = appointmentData;
            mockClientRepository.findByUserId.mockResolvedValue(mockClient);
            mockProfessionalRepository.findById.mockResolvedValue(mockProfessional);
            mockServiceRepository.findById.mockResolvedValue(mockService);
            mockProfessionalRepository.getAvailability.mockResolvedValue([{ time: '10:00', available: true }]);
            mockAppointmentRepository.create.mockResolvedValue(mockAppointment);

            await createAppointment(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockAppointment,
                message: 'Appointment created successfully'
            });
        });

        it('should return 400 when required fields are missing', async () => {
            mockRequest.body = { datetime: '2025-06-15T10:00:00Z' }; // Missing professional_id and service_id

            await createAppointment(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Datetime, professional and service are required'
            });
        });

        it('should return 401 when user is not authenticated', async () => {
            mockRequest.user = undefined;
            mockRequest.body = {
                datetime: '2025-06-15T10:00:00Z',
                professional_id: 1,
                service_id: 1
            };

            await createAppointment(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'User not authenticated'
            });
        });

        it('should return 404 when client not found', async () => {
            mockRequest.body = {
                datetime: '2025-06-15T10:00:00Z',
                professional_id: 1,
                service_id: 1
            };
            mockClientRepository.findByUserId.mockResolvedValue(null);

            await createAppointment(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Client not found for this user'
            });
        });

        it('should return 409 when professional is not available', async () => {
            const appointmentData = {
                datetime: '2025-06-15T10:00:00Z',
                professional_id: 1,
                service_id: 1
            };

            const mockClient = { id: 1, user_id: 1 };
            const mockProfessional = { id: 1, name: 'Dr. Smith' };
            const mockService = { id: 1, name: 'Consultation' };

            mockRequest.body = appointmentData;
            mockClientRepository.findByUserId.mockResolvedValue(mockClient);
            mockProfessionalRepository.findById.mockResolvedValue(mockProfessional);
            mockServiceRepository.findById.mockResolvedValue(mockService);
            mockProfessionalRepository.getAvailability.mockResolvedValue([]); // No availability

            await createAppointment(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(409);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'The professional is not available at this time'
            });
        });
    });

    describe('getMyAppointments', () => {
        it('should return client appointments successfully', async () => {
            const mockClient = { id: 1, user_id: 1 };
            const mockAppointments = [
                { id: 1, datetime: '2025-06-15T10:00:00Z', status: 'pending' },
                { id: 2, datetime: '2025-06-16T11:00:00Z', status: 'confirmed' }
            ];

            mockClientRepository.findByUserId.mockResolvedValue(mockClient);
            mockAppointmentRepository.findByClientId.mockResolvedValue(mockAppointments);

            await getMyAppointments(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockAppointments
            });
        });

        it('should return professional appointments successfully', async () => {
            const mockProfessional = { id: 1, user_id: 1 };
            const mockAppointments = [
                { id: 1, datetime: '2025-06-15T10:00:00Z', status: 'pending' }
            ];

            mockRequest.user = { id: 1, email: 'test@example.com', rol: 'PROFESSIONAL' };
            mockProfessionalRepository.findByUserId.mockResolvedValue(mockProfessional);
            mockAppointmentRepository.findByProfessionalId.mockResolvedValue(mockAppointments);

            await getMyAppointments(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockAppointments
            });
        });

        it('should return all appointments for admin', async () => {
            const mockAppointments = [
                { id: 1, datetime: '2025-06-15T10:00:00Z', status: 'pending' },
                { id: 2, datetime: '2025-06-16T11:00:00Z', status: 'confirmed' }
            ];

            mockRequest.user = { id: 1, email: 'admin@example.com', rol: 'admin' };
            mockAppointmentRepository.findAll.mockResolvedValue(mockAppointments);

            await getMyAppointments(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockAppointments
            });
        });

        it('should filter appointments by status', async () => {
            const mockClient = { id: 1, user_id: 1 };
            const allAppointments = [
                { id: 1, datetime: '2025-06-15T10:00:00Z', status: 'pending' },
                { id: 2, datetime: '2025-06-16T11:00:00Z', status: 'confirmed' }
            ];

            mockRequest.query = { status: 'pending' };
            mockClientRepository.findByUserId.mockResolvedValue(mockClient);
            mockAppointmentRepository.findByClientId.mockResolvedValue(allAppointments);

            await getMyAppointments(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: [allAppointments[0]] // Only pending appointment
            });
        });

        it('should return 401 when user is not authenticated', async () => {
            mockRequest.user = undefined;

            await getMyAppointments(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'User not authenticated'
            });
        });

        it('should return 403 for unauthorized role', async () => {
            mockRequest.user = { id: 1, email: 'test@example.com', rol: 'UNAUTHORIZED' };

            await getMyAppointments(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Unauthorized role'
            });
        });
    });

    describe('getAppointmentById', () => {
        it('should return appointment successfully for authorized client', async () => {
            const mockAppointment = {
                id: 1,
                datetime: '2025-06-15T10:00:00Z',
                client_id: 1,
                professional_id: 1,
                status: 'pending'
            };
            const mockClient = { id: 1, user_id: 1 };

            mockRequest.params = { id: '1' };
            mockAppointmentRepository.findById.mockResolvedValue(mockAppointment);
            mockClientRepository.findByUserId.mockResolvedValue(mockClient);

            await getAppointmentById(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockAppointment
            });
        });

        it('should return 400 for invalid appointment ID', async () => {
            mockRequest.params = { id: 'invalid' };

            await getAppointmentById(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid appointment ID'
            });
        });

        it('should return 404 when appointment not found', async () => {
            mockRequest.params = { id: '999' };
            mockAppointmentRepository.findById.mockResolvedValue(null);

            await getAppointmentById(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Appointment not found'
            });
        });

        it('should return 403 when client has no permission', async () => {
            const mockAppointment = {
                id: 1,
                datetime: '2025-06-15T10:00:00Z',
                client_id: 2, // Different client
                professional_id: 1,
                status: 'pending'
            };
            const mockClient = { id: 1, user_id: 1 }; // Current user's client

            mockRequest.params = { id: '1' };
            mockAppointmentRepository.findById.mockResolvedValue(mockAppointment);
            mockClientRepository.findByUserId.mockResolvedValue(mockClient);

            await getAppointmentById(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'No tienes permisos para ver esta cita'
            });
        });

        it('should return appointment for admin regardless of ownership', async () => {
            const mockAppointment = {
                id: 1,
                datetime: '2025-06-15T10:00:00Z',
                client_id: 2,
                professional_id: 1,
                status: 'pending'
            };

            mockRequest.params = { id: '1' };
            mockRequest.user = { id: 1, email: 'admin@example.com', rol: 'ADMIN' };
            mockAppointmentRepository.findById.mockResolvedValue(mockAppointment);

            await getAppointmentById(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockAppointment
            });
        });
    });

    describe('cancelAppointment', () => {
        it('should cancel appointment successfully', async () => {
            const mockAppointment = {
                id: 1,
                datetime: '2025-06-15T10:00:00Z',
                client_id: 1,
                professional_id: 1,
                status: 'pending'
            };
            const mockClient = { id: 1, user_id: 1 };
            const updatedAppointment = { ...mockAppointment, status: 'cancelled' };

            mockRequest.params = { id: '1' };
            mockAppointmentRepository.findById.mockResolvedValue(mockAppointment);
            mockClientRepository.findByUserId.mockResolvedValue(mockClient);
            mockAppointmentRepository.update.mockResolvedValue(updatedAppointment);

            await cancelAppointment(mockRequest as Request, mockResponse as Response);

            expect(mockAppointmentRepository.update).toHaveBeenCalledWith(1, { status: 'cancelled' });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: updatedAppointment,
                message: 'Appointment cancelled successfully'
            });
        });

        it('should return 400 when appointment is already cancelled', async () => {
            const mockAppointment = {
                id: 1,
                datetime: '2025-06-15T10:00:00Z',
                client_id: 1,
                professional_id: 1,
                status: 'cancelled'
            };
            const mockClient = { id: 1, user_id: 1 };

            mockRequest.params = { id: '1' };
            mockAppointmentRepository.findById.mockResolvedValue(mockAppointment);
            mockClientRepository.findByUserId.mockResolvedValue(mockClient);

            await cancelAppointment(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'The appointment is already cancelled'
            });
        });

        it('should return 403 when user has no permission to cancel', async () => {
            const mockAppointment = {
                id: 1,
                datetime: '2025-06-15T10:00:00Z',
                client_id: 2, // Different client
                professional_id: 1,
                status: 'pending'
            };
            const mockClient = { id: 1, user_id: 1 }; // Current user's client

            mockRequest.params = { id: '1' };
            mockAppointmentRepository.findById.mockResolvedValue(mockAppointment);
            mockClientRepository.findByUserId.mockResolvedValue(mockClient);

            await cancelAppointment(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'You do not have permission to cancel this appointment'
            });
        });
    });

    describe('getAllAppointments', () => {
        it('should return all appointments with pagination', async () => {
            const mockAppointments = [
                { id: 1, datetime: '2025-06-15T10:00:00Z', status: 'pending' },
                { id: 2, datetime: '2025-06-16T11:00:00Z', status: 'confirmed' }
            ];

            mockRequest.query = { page: '1', limit: '10' };
            mockAppointmentRepository.findAll.mockResolvedValue(mockAppointments);

            await getAllAppointments(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockAppointments,
                pagination: {
                    total: 2,
                    page: 1,
                    limit: 10,
                    pages: 1
                }
            });
        });

        it('should filter appointments by status', async () => {
            const mockAppointments = [
                { id: 1, datetime: '2025-06-15T10:00:00Z', status: 'pending' },
                { id: 2, datetime: '2025-06-16T11:00:00Z', status: 'confirmed' }
            ];

            mockRequest.query = { status: 'pending' };
            mockAppointmentRepository.findAll.mockResolvedValue(mockAppointments);

            await getAllAppointments(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: [mockAppointments[0]], // Only pending appointment
                pagination: {
                    total: 1,
                    page: 1,
                    limit: 10,
                    pages: 1
                }
            });
        });

        it('should filter appointments by date range', async () => {
            const mockAppointments = [
                { id: 1, datetime: '2025-06-15T10:00:00Z', status: 'pending' },
                { id: 2, datetime: '2025-06-20T11:00:00Z', status: 'confirmed' }
            ];

            mockRequest.query = {
                start_date: '2025-06-14',
                end_date: '2025-06-16'
            };
            mockAppointmentRepository.findAll.mockResolvedValue(mockAppointments);

            await getAllAppointments(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: [mockAppointments[0]], // Only appointment in date range
                pagination: {
                    total: 1,
                    page: 1,
                    limit: 10,
                    pages: 1
                }
            });
        });

        it('should handle errors gracefully', async () => {
            mockAppointmentRepository.findAll.mockRejectedValue(new Error('Database error'));

            await getAllAppointments(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Internal server error'
            });
        });
    });
});
