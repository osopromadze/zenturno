import { prisma } from '../../db/prisma';
import { Client } from '@prisma/client';
import { logger } from '../../../utils/logger';

export interface CreateClientInput {
    name: string;
    phone?: string;
    user_id?: number;
}

export interface UpdateClientInput {
    name?: string;
    phone?: string;
    user_id?: number;
}

export class ClientRepository {
    /**
     * Find a client by ID
     */
    async findById(id: number): Promise<Client | null> {
        try {
            return await prisma.client.findUnique({
                where: { id },
                include: {
                    user: true,
                    appointments: true
                }
            });
        } catch (error) {
            logger.error(`Error finding client by ID: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Find a client by user ID
     */
    async findByUserId(userId: number): Promise<Client | null> {
        try {
            return await prisma.client.findUnique({
                where: { user_id: userId },
                include: {
                    user: true,
                    appointments: true
                }
            });
        } catch (error) {
            logger.error(`Error finding client by user ID: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Create a new client
     */
    async create(data: CreateClientInput): Promise<Client> {
        try {
            return await prisma.client.create({
                data,
                include: {
                    user: true
                }
            });
        } catch (error) {
            logger.error(`Error creating client: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Update an existing client
     */
    async update(id: number, data: UpdateClientInput): Promise<Client> {
        try {
            return await prisma.client.update({
                where: { id },
                data,
                include: {
                    user: true
                }
            });
        } catch (error) {
            logger.error(`Error updating client: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Delete a client
     */
    async delete(id: number): Promise<Client> {
        try {
            return await prisma.client.delete({
                where: { id }
            });
        } catch (error) {
            logger.error(`Error deleting client: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Find all clients
     */
    async findAll(): Promise<Client[]> {
        try {
            return await prisma.client.findMany({
                include: {
                    user: true
                }
            });
        } catch (error) {
            logger.error(`Error finding all clients: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Find clients by name (partial match)
     */
    async findByName(name: string): Promise<Client[]> {
        try {
            return await prisma.client.findMany({
                where: {
                    name: {
                        contains: name,
                        mode: 'insensitive'
                    }
                },
                include: {
                    user: true
                }
            });
        } catch (error) {
            logger.error(`Error finding clients by name: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Get client appointment history
     */
    async getAppointmentHistory(clientId: number): Promise<any[]> {
        try {
            return await prisma.appointment.findMany({
                where: {
                    client_id: clientId
                },
                include: {
                    professional: true,
                    service: true
                },
                orderBy: {
                    datetime: 'desc'
                }
            });
        } catch (error) {
            logger.error(`Error getting client appointment history: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
}
