import { useState, useCallback } from 'react';

// Hook personalizado para manejar reservas de citas
export const useReservas = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para crear una nueva reserva
  const createReservation = useCallback(async (reservationData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Si hay autenticación
        },
        body: JSON.stringify({
          cliente_id: reservationData.clientId || 1, // Por ahora hardcodeado
          profesional_id: reservationData.professionalId,
          servicio_id: reservationData.serviceId,
          fecha_hora: `${reservationData.date}T${reservationData.time}:00.000Z`,
          notas: reservationData.clientNotes || ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la reserva');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Error de conexión';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para obtener disponibilidad de un profesional
  const getAvailability = useCallback(async (professionalId, fechaInicio, fechaFin) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/profesionales/${professionalId}/disponibilidad?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener disponibilidad');
      }

      const availability = await response.json();
      return availability;
    } catch (err) {
      const errorMessage = err.message || 'Error de conexión';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para cancelar una reserva
  const cancelReservation = useCallback(async (reservaId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reservas/${reservaId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cancelar la reserva');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Error de conexión';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para obtener las reservas del usuario
  const getUserReservations = useCallback(async (clienteId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/clientes/${clienteId}/reservas`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener las reservas');
      }

      const reservations = await response.json();
      return reservations;
    } catch (err) {
      const errorMessage = err.message || 'Error de conexión';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para simular datos mientras no hay backend
  const mockCreateReservation = useCallback(async (reservationData) => {
    setLoading(true);
    setError(null);

    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simular validaciones que haría el backend
      if (!reservationData.serviceId || !reservationData.professionalId || 
          !reservationData.date || !reservationData.time) {
        throw new Error('Todos los campos son obligatorios');
      }

      // Simular respuesta exitosa del backend
      const mockResponse = {
        id: Math.floor(Math.random() * 1000) + 1,
        cliente_id: 1,
        profesional_id: reservationData.professionalId,
        servicio_id: reservationData.serviceId,
        fecha_hora: `${reservationData.date}T${reservationData.time}:00.000Z`,
        estado: 'pendiente',
        created_at: new Date().toISOString(),
        notas: reservationData.clientNotes || ''
      };

      return mockResponse;
    } catch (err) {
      const errorMessage = err.message || 'Error al procesar la reserva';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    createReservation,
    getAvailability,
    cancelReservation,
    getUserReservations,
    mockCreateReservation, // Para desarrollo sin backend
    clearError
  };
}; 