import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ReservaForm from '../ReservaForm';

// Mock del hook useReservas
jest.mock('../../hooks/useReservas', () => ({
  useReservas: () => ({
    loading: false,
    error: null,
    mockCreateReservation: jest.fn().mockResolvedValue({
      id: 123,
      cliente_id: 1,
      profesional_id: 1,
      servicio_id: 1,
      fecha_hora: '2024-12-20T10:00:00.000Z',
      estado: 'pendiente'
    }),
    clearError: jest.fn()
  })
}));

// Componente wrapper para las pruebas
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('ReservaForm - Ticket 2 Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Componentes requeridos', () => {
    test('debe mostrar dropdown para seleccionar servicio', () => {
      render(
        <TestWrapper>
          <ReservaForm />
        </TestWrapper>
      );

      const serviceSelect = screen.getByLabelText(/servicio/i);
      expect(serviceSelect).toBeInTheDocument();
      expect(serviceSelect.closest('[role="combobox"]')).toBeInTheDocument();
    });

    test('debe mostrar dropdown para seleccionar profesional', () => {
      render(
        <TestWrapper>
          <ReservaForm />
        </TestWrapper>
      );

      const professionalSelect = screen.getByLabelText(/profesional/i);
      expect(professionalSelect).toBeInTheDocument();
      expect(professionalSelect.closest('[role="combobox"]')).toBeInTheDocument();
    });

    test('debe mostrar selector de fecha', () => {
      render(
        <TestWrapper>
          <ReservaForm />
        </TestWrapper>
      );

      const dateInput = screen.getByLabelText(/fecha/i);
      expect(dateInput).toBeInTheDocument();
      expect(dateInput).toHaveAttribute('type', 'date');
    });

    test('debe mostrar selector de hora', () => {
      render(
        <TestWrapper>
          <ReservaForm />
        </TestWrapper>
      );

      const timeInput = screen.getByLabelText(/hora/i);
      expect(timeInput).toBeInTheDocument();
      expect(timeInput).toHaveAttribute('type', 'time');
    });

    test('debe mostrar botón de confirmación', () => {
      render(
        <TestWrapper>
          <ReservaForm />
        </TestWrapper>
      );

      const confirmButton = screen.getByRole('button', { name: /confirmar reserva/i });
      expect(confirmButton).toBeInTheDocument();
      expect(confirmButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('Validaciones - todos los campos obligatorios', () => {
    test('debe mostrar error cuando se envía formulario sin datos', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ReservaForm />
        </TestWrapper>
      );

      const confirmButton = screen.getByRole('button', { name: /confirmar reserva/i });
      await user.click(confirmButton);

      expect(screen.getByText('El servicio es obligatorio')).toBeInTheDocument();
      expect(screen.getByText('El profesional es obligatorio')).toBeInTheDocument();
      expect(screen.getByText('La fecha es obligatoria')).toBeInTheDocument();
      expect(screen.getByText('La hora es obligatoria')).toBeInTheDocument();
    });

    test('debe mostrar error cuando falta solo el servicio', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ReservaForm />
        </TestWrapper>
      );

      // Llenar solo fecha y hora
      const dateInput = screen.getByLabelText(/fecha/i);
      const timeInput = screen.getByLabelText(/hora/i);
      
      await user.type(dateInput, '2024-12-25');
      await user.type(timeInput, '10:00');

      const confirmButton = screen.getByRole('button', { name: /confirmar reserva/i });
      await user.click(confirmButton);

      expect(screen.getByText('El servicio es obligatorio')).toBeInTheDocument();
    });

    test('debe limpiar errores cuando el usuario corrige los campos', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ReservaForm />
        </TestWrapper>
      );

      // Enviar formulario vacío para generar errores
      const confirmButton = screen.getByRole('button', { name: /confirmar reserva/i });
      await user.click(confirmButton);

      expect(screen.getByText('El servicio es obligatorio')).toBeInTheDocument();

      // Seleccionar un servicio
      const serviceSelect = screen.getByLabelText(/servicio/i);
      await user.click(serviceSelect);
      await user.click(screen.getByText(/corte de cabello/i));

      // El error del servicio debe desaparecer
      expect(screen.queryByText('El servicio es obligatorio')).not.toBeInTheDocument();
    });
  });

  describe('Funcionalidad de dropdowns', () => {
    test('debe mostrar opciones de servicios en el dropdown', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ReservaForm />
        </TestWrapper>
      );

      const serviceSelect = screen.getByLabelText(/servicio/i);
      await user.click(serviceSelect);

      expect(screen.getByText(/corte de cabello/i)).toBeInTheDocument();
      expect(screen.getByText(/tinte y peinado/i)).toBeInTheDocument();
      expect(screen.getByText(/manicura/i)).toBeInTheDocument();
      expect(screen.getByText(/tratamiento facial/i)).toBeInTheDocument();
    });

    test('debe filtrar profesionales según el servicio seleccionado', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ReservaForm />
        </TestWrapper>
      );

      // Seleccionar servicio de Manicura
      const serviceSelect = screen.getByLabelText(/servicio/i);
      await user.click(serviceSelect);
      await user.click(screen.getByText(/manicura/i));

      // Ahora verificar profesionales disponibles para manicura
      const professionalSelect = screen.getByLabelText(/profesional/i);
      await user.click(professionalSelect);

      // Solo María Rodríguez y Javier Morales deberían aparecer para manicura
      expect(screen.getByText(/maría rodríguez/i)).toBeInTheDocument();
      expect(screen.getByText(/javier morales/i)).toBeInTheDocument();
      
      // Ana García y Carlos López no deberían aparecer
      expect(screen.queryByText(/ana garcía/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/carlos lópez/i)).not.toBeInTheDocument();
    });

    test('debe deshabilitar dropdown de profesional cuando no hay servicio seleccionado', () => {
      render(
        <TestWrapper>
          <ReservaForm />
        </TestWrapper>
      );

      const professionalSelect = screen.getByLabelText(/profesional/i);
      expect(professionalSelect).toBeDisabled();
      expect(screen.getByText('Seleccione primero un servicio')).toBeInTheDocument();
    });
  });

  describe('Integración con backend', () => {
    test('debe enviar datos correctamente al endpoint /reservas', async () => {
      const mockCreateReservation = jest.fn().mockResolvedValue({
        id: 456,
        cliente_id: 1,
        profesional_id: 1,
        servicio_id: 1,
        fecha_hora: '2024-12-25T10:00:00.000Z',
        estado: 'pendiente'
      });

      // Mock el hook con función personalizada
      jest.doMock('../../hooks/useReservas', () => ({
        useReservas: () => ({
          loading: false,
          error: null,
          mockCreateReservation,
          clearError: jest.fn()
        })
      }));

      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ReservaForm />
        </TestWrapper>
      );

      // Llenar formulario completo
      const serviceSelect = screen.getByLabelText(/servicio/i);
      await user.click(serviceSelect);
      await user.click(screen.getByText(/corte de cabello/i));

      const professionalSelect = screen.getByLabelText(/profesional/i);
      await user.click(professionalSelect);
      await user.click(screen.getByText(/ana garcía/i));

      const dateInput = screen.getByLabelText(/fecha/i);
      await user.type(dateInput, '2024-12-25');

      const timeInput = screen.getByLabelText(/hora/i);
      await user.type(timeInput, '10:00');

      // Enviar formulario
      const confirmButton = screen.getByRole('button', { name: /confirmar reserva/i });
      await user.click(confirmButton);

      // Verificar que se llamó la función con los datos correctos
      await waitFor(() => {
        expect(mockCreateReservation).toHaveBeenCalledWith({
          serviceId: 1,
          professionalId: 1,
          date: '2024-12-25',
          time: '10:00'
        });
      });
    });

    test('debe mostrar mensaje de éxito al completar la reserva', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ReservaForm />
        </TestWrapper>
      );

      // Llenar y enviar formulario
      const serviceSelect = screen.getByLabelText(/servicio/i);
      await user.click(serviceSelect);
      await user.click(screen.getByText(/corte de cabello/i));

      const professionalSelect = screen.getByLabelText(/profesional/i);
      await user.click(professionalSelect);
      await user.click(screen.getByText(/ana garcía/i));

      await user.type(screen.getByLabelText(/fecha/i), '2024-12-25');
      await user.type(screen.getByLabelText(/hora/i), '10:00');

      const confirmButton = screen.getByRole('button', { name: /confirmar reserva/i });
      await user.click(confirmButton);

      // Verificar mensaje de éxito
      await waitFor(() => {
        expect(screen.getByText(/reserva creada exitosamente/i)).toBeInTheDocument();
      });
    });

    test('debe mostrar errores del backend cuando la API falla', () => {
      // Mock error del backend
      jest.doMock('../../hooks/useReservas', () => ({
        useReservas: () => ({
          loading: false,
          error: 'Error del servidor: No se pudo crear la reserva',
          mockCreateReservation: jest.fn(),
          clearError: jest.fn()
        })
      }));

      render(
        <TestWrapper>
          <ReservaForm />
        </TestWrapper>
      );

      expect(screen.getByText('Error del servidor: No se pudo crear la reserva')).toBeInTheDocument();
    });
  });

  describe('Interfaz responsiva y accesible', () => {
    test('debe tener labels accesibles para todos los campos', () => {
      render(
        <TestWrapper>
          <ReservaForm />
        </TestWrapper>
      );

      expect(screen.getByLabelText(/servicio/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/profesional/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/hora/i)).toBeInTheDocument();
    });

    test('debe mostrar estados de carga apropiados', () => {
      // Mock estado de carga
      jest.doMock('../../hooks/useReservas', () => ({
        useReservas: () => ({
          loading: true,
          error: null,
          mockCreateReservation: jest.fn(),
          clearError: jest.fn()
        })
      }));

      render(
        <TestWrapper>
          <ReservaForm />
        </TestWrapper>
      );

      const confirmButton = screen.getByRole('button', { name: /procesando/i });
      expect(confirmButton).toBeDisabled();
    });

    test('debe mostrar resumen de la cita cuando todos los campos están llenos', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ReservaForm />
        </TestWrapper>
      );

      // Llenar todos los campos
      const serviceSelect = screen.getByLabelText(/servicio/i);
      await user.click(serviceSelect);
      await user.click(screen.getByText(/corte de cabello/i));

      const professionalSelect = screen.getByLabelText(/profesional/i);
      await user.click(professionalSelect);
      await user.click(screen.getByText(/ana garcía/i));

      await user.type(screen.getByLabelText(/fecha/i), '2024-12-25');
      await user.type(screen.getByLabelText(/hora/i), '10:00');

      // Verificar que aparece el resumen
      await waitFor(() => {
        expect(screen.getByText('Resumen de la Cita')).toBeInTheDocument();
        expect(screen.getByText(/corte de cabello/i)).toBeInTheDocument();
        expect(screen.getByText(/ana garcía/i)).toBeInTheDocument();
      });
    });
  });

  describe('Funcionalidad completa del formulario', () => {
    test('debe completar el flujo completo de reserva exitosa', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ReservaForm />
        </TestWrapper>
      );

      // 1. Seleccionar servicio
      await user.click(screen.getByLabelText(/servicio/i));
      await user.click(screen.getByText(/corte de cabello/i));

      // 2. Seleccionar profesional  
      await user.click(screen.getByLabelText(/profesional/i));
      await user.click(screen.getByText(/ana garcía/i));

      // 3. Seleccionar fecha y hora
      await user.type(screen.getByLabelText(/fecha/i), '2024-12-25');
      await user.type(screen.getByLabelText(/hora/i), '14:30');

      // 4. Verificar resumen
      await waitFor(() => {
        expect(screen.getByText('Resumen de la Cita')).toBeInTheDocument();
      });

      // 5. Confirmar reserva
      await user.click(screen.getByRole('button', { name: /confirmar reserva/i }));

      // 6. Verificar éxito y formulario limpio
      await waitFor(() => {
        expect(screen.getByText(/reserva creada exitosamente/i)).toBeInTheDocument();
      });

      // Verificar que el formulario se limpió
      expect(screen.getByLabelText(/servicio/i)).toHaveValue('');
      expect(screen.getByLabelText(/fecha/i)).toHaveValue('');
      expect(screen.getByLabelText(/hora/i)).toHaveValue('');
    });
  });
}); 