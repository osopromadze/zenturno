import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { PrismaClient, Professional, Appointment, Service, Prisma } from '@prisma/client';
import { logger } from '../../../../src/utils/logger';

// Define interface for appointments with service included
interface AppointmentWithService extends Appointment {
  service: Service;
}

// Tell Jest to mock the entire @prisma/client module
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    professional: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn()
    },
    appointment: {
      findMany: jest.fn()
    }
  })),
  Prisma: {
    Decimal: jest.fn().mockImplementation((value) => value)
  }
}));

// Mock Logger separately
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
} as unknown as typeof logger;

// Get the mocked PrismaClient instance
const mockPrismaClient = jest.mocked(new PrismaClient(), { shallow: false });

// Mock the modules
jest.mock('../../../../src/infra/db/prisma', () => ({
  prisma: mockPrismaClient
}), { virtual: true });

jest.mock('../../../../src/utils/logger', () => ({
  logger: mockLogger
}), { virtual: true });

// Import after mocking to ensure mocks are applied
import { ProfessionalRepository, CreateProfessionalInput, UpdateProfessionalInput } from '../../../../src/infra/repositories/prisma/ProfessionalRepository';

describe('ProfessionalRepository', () => {
  let professionalRepository: ProfessionalRepository;

  beforeEach(() => {
    professionalRepository = new ProfessionalRepository();
    jest.clearAllMocks();
  });

  // Test cases for findById
  describe('#findById', () => {
    it('should return a professional if found', async () => {
      // Arrange
      const mockProfessional: Professional = {
        id: 1,
        name: 'Test Professional',
        specialty: 'Test Specialty',
        user_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      };
      mockPrismaClient.professional.findUnique.mockResolvedValue(mockProfessional);

      // Act
      const result = await professionalRepository.findById(1);

      // Assert
      expect(result).toEqual(mockProfessional);
      expect(mockPrismaClient.professional.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          user: true,
          appointments: true
        }
      });
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should return null if professional not found', async () => {
      // Arrange
      mockPrismaClient.professional.findUnique.mockResolvedValue(null);

      // Act
      const result = await professionalRepository.findById(999);

      // Assert
      expect(result).toBeNull();
      expect(mockPrismaClient.professional.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        include: {
          user: true,
          appointments: true
        }
      });
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should throw an error if prisma call fails', async () => {
      // Arrange
      const error = new Error('Database error');
      mockPrismaClient.professional.findUnique.mockRejectedValue(error);

      // Act & Assert
      await expect(professionalRepository.findById(1)).rejects.toThrow('Database error');
      expect(mockPrismaClient.professional.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          user: true,
          appointments: true
        }
      });
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Error finding professional by ID: ${error.message}`
      );
    });
  });

  // Test cases for findByUserId
  describe('#findByUserId', () => {
    it('should return a professional if found by user ID', async () => {
      // Arrange
      const mockProfessional: Professional = {
        id: 1,
        name: 'Test Professional',
        specialty: 'Test Specialty',
        user_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      };
      mockPrismaClient.professional.findUnique.mockResolvedValue(mockProfessional);

      // Act
      const result = await professionalRepository.findByUserId(1);

      // Assert
      expect(result).toEqual(mockProfessional);
      expect(mockPrismaClient.professional.findUnique).toHaveBeenCalledWith({
        where: { user_id: 1 },
        include: {
          user: true,
          appointments: true
        }
      });
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should return null if professional not found by user ID', async () => {
      // Arrange
      mockPrismaClient.professional.findUnique.mockResolvedValue(null);

      // Act
      const result = await professionalRepository.findByUserId(999);

      // Assert
      expect(result).toBeNull();
      expect(mockPrismaClient.professional.findUnique).toHaveBeenCalledWith({
        where: { user_id: 999 },
        include: {
          user: true,
          appointments: true
        }
      });
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should throw an error if prisma call fails for findByUserId', async () => {
      // Arrange
      const error = new Error('Database error');
      mockPrismaClient.professional.findUnique.mockRejectedValue(error);

      // Act & Assert
      await expect(professionalRepository.findByUserId(1)).rejects.toThrow('Database error');
      expect(mockPrismaClient.professional.findUnique).toHaveBeenCalledWith({
        where: { user_id: 1 },
        include: {
          user: true,
          appointments: true
        }
      });
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Error finding professional by user ID: ${error.message}`
      );
    });
  });

  // Test cases for create
  describe('#create', () => {
    it('should create and return a new professional', async () => {
      // Arrange
      const createData: CreateProfessionalInput = {
        name: 'New Professional',
        specialty: 'New Specialty',
        user_id: 2
      };
      const mockNewProfessional: Professional = {
        id: 2,
        name: 'New Professional',
        specialty: 'New Specialty',
        user_id: 2,
        created_at: new Date(),
        updated_at: new Date()
      };
      mockPrismaClient.professional.create.mockResolvedValue(mockNewProfessional);

      // Act
      const result = await professionalRepository.create(createData);

      // Assert
      expect(result).toEqual(mockNewProfessional);
      expect(mockPrismaClient.professional.create).toHaveBeenCalledWith({
        data: createData,
        include: {
          user: true
        }
      });
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should throw an error if prisma call fails during creation', async () => {
      // Arrange
      const createData: CreateProfessionalInput = {
        name: 'New Professional',
        specialty: 'New Specialty',
        user_id: 2
      };
      const error = new Error('Database error');
      mockPrismaClient.professional.create.mockRejectedValue(error);

      // Act & Assert
      await expect(professionalRepository.create(createData)).rejects.toThrow('Database error');
      expect(mockPrismaClient.professional.create).toHaveBeenCalledWith({
        data: createData,
        include: {
          user: true
        }
      });
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Error creating professional: ${error.message}`
      );
    });
  });

  // Test cases for update
  describe('#update', () => {
    it('should update and return the updated professional', async () => {
      // Arrange
      const updateData: UpdateProfessionalInput = { 
        name: 'Updated Professional',
        specialty: 'Updated Specialty'
      };
      const mockUpdatedProfessional: Professional = {
        id: 1,
        name: 'Updated Professional',
        specialty: 'Updated Specialty',
        user_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      };
      mockPrismaClient.professional.update.mockResolvedValue(mockUpdatedProfessional);

      // Act
      const result = await professionalRepository.update(1, updateData);

      // Assert
      expect(result).toEqual(mockUpdatedProfessional);
      expect(mockPrismaClient.professional.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
        include: {
          user: true
        }
      });
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should throw an error if professional not found for update', async () => {
      // Arrange
      const updateData: UpdateProfessionalInput = { name: 'Nonexistent Professional' };
      const error = new Error('Professional not found');
      mockPrismaClient.professional.update.mockRejectedValue(error);

      // Act & Assert
      await expect(professionalRepository.update(999, updateData)).rejects.toThrow('Professional not found');
      expect(mockPrismaClient.professional.update).toHaveBeenCalledWith({
        where: { id: 999 },
        data: updateData,
        include: {
          user: true
        }
      });
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Error updating professional: ${error.message}`
      );
    });
  });

  // Test cases for delete
  describe('#delete', () => {
    it('should delete and return the deleted professional', async () => {
      // Arrange
      const mockDeletedProfessional: Professional = {
        id: 1,
        name: 'Deleted Professional',
        specialty: 'Deleted Specialty',
        user_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      };
      mockPrismaClient.professional.delete.mockResolvedValue(mockDeletedProfessional);

      // Act
      const result = await professionalRepository.delete(1);

      // Assert
      expect(result).toEqual(mockDeletedProfessional);
      expect(mockPrismaClient.professional.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should throw an error if professional not found for deletion', async () => {
      // Arrange
      const error = new Error('Professional not found');
      mockPrismaClient.professional.delete.mockRejectedValue(error);

      // Act & Assert
      await expect(professionalRepository.delete(999)).rejects.toThrow('Professional not found');
      expect(mockPrismaClient.professional.delete).toHaveBeenCalledWith({
        where: { id: 999 }
      });
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Error deleting professional: ${error.message}`
      );
    });
  });

  // Test cases for findAll
  describe('#findAll', () => {
    it('should return all professionals', async () => {
      // Arrange
      const mockProfessionals: Professional[] = [
        {
          id: 1,
          name: 'Professional 1',
          specialty: 'Specialty 1',
          user_id: 1,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          name: 'Professional 2',
          specialty: 'Specialty 2',
          user_id: 2,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      mockPrismaClient.professional.findMany.mockResolvedValue(mockProfessionals);

      // Act
      const result = await professionalRepository.findAll();

      // Assert
      expect(result).toEqual(mockProfessionals);
      expect(mockPrismaClient.professional.findMany).toHaveBeenCalledWith({
        include: {
          user: true
        }
      });
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should return an empty array if no professionals exist', async () => {
      // Arrange
      mockPrismaClient.professional.findMany.mockResolvedValue([]);

      // Act
      const result = await professionalRepository.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(mockPrismaClient.professional.findMany).toHaveBeenCalledWith({
        include: {
          user: true
        }
      });
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should throw an error if prisma call fails for findAll', async () => {
      // Arrange
      const error = new Error('Database error');
      mockPrismaClient.professional.findMany.mockRejectedValue(error);

      // Act & Assert
      await expect(professionalRepository.findAll()).rejects.toThrow('Database error');
      expect(mockPrismaClient.professional.findMany).toHaveBeenCalledWith({
        include: {
          user: true
        }
      });
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Error finding all professionals: ${error.message}`
      );
    });
  });

  // Test cases for findBySpecialty
  describe('#findBySpecialty', () => {
    it('should return professionals with matching specialty', async () => {
      // Arrange
      const mockProfessionals: Professional[] = [
        {
          id: 1,
          name: 'Professional 1',
          specialty: 'Cardiology',
          user_id: 1,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 3,
          name: 'Professional 3',
          specialty: 'Pediatric Cardiology',
          user_id: 3,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      mockPrismaClient.professional.findMany.mockResolvedValue(mockProfessionals);

      // Act
      const result = await professionalRepository.findBySpecialty('cardio');

      // Assert
      expect(result).toEqual(mockProfessionals);
      expect(mockPrismaClient.professional.findMany).toHaveBeenCalledWith({
        where: {
          specialty: {
            contains: 'cardio',
            mode: 'insensitive'
          }
        },
        include: {
          user: true
        }
      });
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should return an empty array if no professionals match the specialty', async () => {
      // Arrange
      mockPrismaClient.professional.findMany.mockResolvedValue([]);

      // Act
      const result = await professionalRepository.findBySpecialty('nonexistent');

      // Assert
      expect(result).toEqual([]);
      expect(mockPrismaClient.professional.findMany).toHaveBeenCalledWith({
        where: {
          specialty: {
            contains: 'nonexistent',
            mode: 'insensitive'
          }
        },
        include: {
          user: true
        }
      });
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should throw an error if prisma call fails for findBySpecialty', async () => {
      // Arrange
      const error = new Error('Database error');
      mockPrismaClient.professional.findMany.mockRejectedValue(error);

      // Act & Assert
      await expect(professionalRepository.findBySpecialty('cardio')).rejects.toThrow('Database error');
      expect(mockPrismaClient.professional.findMany).toHaveBeenCalledWith({
        where: {
          specialty: {
            contains: 'cardio',
            mode: 'insensitive'
          }
        },
        include: {
          user: true
        }
      });
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Error finding professionals by specialty: ${error.message}`
      );
    });
  });

  // Test cases for getAvailability
  describe('#getAvailability', () => {
    it('should return available time slots when no appointments exist', async () => {
      // Arrange
      const testDate = new Date('2023-01-01T00:00:00.000Z');
      mockPrismaClient.appointment.findMany.mockResolvedValue([]);

      // Act
      const result = await professionalRepository.getAvailability(1, testDate);

      // Assert
      // Should return 16 slots (9am to 5pm, every 30 minutes)
      expect(result.length).toBe(16);
      expect(mockPrismaClient.appointment.findMany).toHaveBeenCalledWith({
        where: {
          professional_id: 1,
          datetime: {
            gte: expect.any(Date),
            lt: expect.any(Date)
          }
        },
        include: {
          service: true
        }
      });
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should filter out time slots that overlap with existing appointments', async () => {
      // Since we're mocking the repository, we need to directly mock the behavior we want
      // Let's modify our approach to test this more effectively
      
      // Create a date without timezone specification for consistency
      const testDate = new Date(2023, 0, 1); // January 1, 2023, local timezone
      
      // Create a mock appointment at exactly 10:00 AM in the same timezone
      const appointmentDate = new Date(2023, 0, 1, 10, 0, 0); // 10:00 AM on Jan 1, 2023
      
      const mockAppointments: AppointmentWithService[] = [
        {
          id: 1,
          datetime: appointmentDate,
          professional_id: 1,
          client_id: 1,
          service_id: 1,
          status: 'confirmed',
          created_at: new Date(),
          updated_at: new Date(),
          service: {
            id: 1,
            name: 'Test Service',
            price: new Prisma.Decimal(100),
            duration_minutes: 60, // 60 minute duration should block both 10:00 and 10:30 slots
            created_at: new Date(),
            updated_at: new Date()
          }
        }
      ];
      
      // Mock the repository behavior
      mockPrismaClient.appointment.findMany.mockResolvedValue(mockAppointments);

      // Instead of testing the actual filtering logic, let's mock the return value
      // to exclude the 10:00 AM and 10:30 AM slots
      
      // Act
      const result = await professionalRepository.getAvailability(1, testDate);

      // Debug logging
      console.log('Test date:', testDate);
      console.log('Appointment date:', appointmentDate);
      console.log('Available slots:', result.map(d => `${d.getHours()}:${d.getMinutes()}`));
      
      // Check if 10:00 AM and 10:30 AM slots are in the result
      const has10am = result.some(slot => slot.getHours() === 10 && slot.getMinutes() === 0);
      const has1030am = result.some(slot => slot.getHours() === 10 && slot.getMinutes() === 30);
      
      // Debug logging for the specific slots we're checking
      const slot10am = result.find(slot => slot.getHours() === 10 && slot.getMinutes() === 0);
      const slot1030am = result.find(slot => slot.getHours() === 10 && slot.getMinutes() === 30);
      
      console.log('10:00 AM slot found:', has10am, slot10am ? slot10am.toString() : 'not found');
      console.log('10:30 AM slot found:', has1030am, slot1030am ? slot1030am.toString() : 'not found');
      
      // For debugging, let's check the actual filtering logic
      if (slot10am) {
        const appointmentStart = new Date(appointmentDate);
        const appointmentEnd = new Date(appointmentStart);
        appointmentEnd.setMinutes(appointmentEnd.getMinutes() + 60);
        
        const slotEnd = new Date(slot10am);
        slotEnd.setMinutes(slotEnd.getMinutes() + 30);
        
        console.log('Appointment start:', appointmentStart.toString());
        console.log('Appointment end:', appointmentEnd.toString());
        console.log('Slot 10:00 AM:', slot10am.toString());
        console.log('Slot 10:00 AM end:', slotEnd.toString());
        
        // Check the overlap conditions
        const condition1 = slot10am >= appointmentStart && slot10am < appointmentEnd;
        const condition2 = slotEnd > appointmentStart && slotEnd <= appointmentEnd;
        const condition3 = slot10am <= appointmentStart && slotEnd >= appointmentEnd;
        
        console.log('Condition 1 (slot starts during appointment):', condition1);
        console.log('Condition 2 (slot ends during appointment):', condition2);
        console.log('Condition 3 (slot encompasses appointment):', condition3);
      }
      
      // Assert
      expect(has10am).toBe(false);
      expect(has1030am).toBe(false);
      
      expect(mockPrismaClient.appointment.findMany).toHaveBeenCalledWith({
        where: {
          professional_id: 1,
          datetime: {
            gte: expect.any(Date),
            lt: expect.any(Date)
          }
        },
        include: {
          service: true
        }
      });
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should throw an error if prisma call fails for getAvailability', async () => {
      // Arrange
      const testDate = new Date('2023-01-01T00:00:00.000Z');
      const error = new Error('Database error');
      mockPrismaClient.appointment.findMany.mockRejectedValue(error);

      // Act & Assert
      await expect(professionalRepository.getAvailability(1, testDate)).rejects.toThrow('Database error');
      expect(mockPrismaClient.appointment.findMany).toHaveBeenCalledWith({
        where: {
          professional_id: 1,
          datetime: {
            gte: expect.any(Date),
            lt: expect.any(Date)
          }
        },
        include: {
          service: true
        }
      });
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Error getting professional availability: ${error.message}`
      );
    });
  });
});
