import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { useReservas } from '../hooks/useReservas';

/**
 * Componente ReservaForm - Formulario de reserva de citas
 * 
 * Implementa exactamente los requerimientos del Ticket 2:
 * - Dropdown para seleccionar el servicio
 * - Dropdown para seleccionar el profesional  
 * - Selector de fecha y hora
 * - Botón de confirmación
 * - Validaciones y mensajes de error
 * - Integración con endpoint /reservas
 */

// Datos simulados (vendrían del backend en producción)
const mockServices = [
  { id: 1, name: 'Corte de Cabello', duration: 30, price: 25 },
  { id: 2, name: 'Tinte y Peinado', duration: 90, price: 60 },
  { id: 3, name: 'Manicura', duration: 45, price: 20 },
  { id: 4, name: 'Tratamiento Facial', duration: 60, price: 45 }
];

const mockProfessionals = [
  { id: 1, name: 'Ana García', specialty: 'Estilista Senior', services: [1, 2] },
  { id: 2, name: 'Carlos López', specialty: 'Barbero Especialista', services: [1] },
  { id: 3, name: 'María Rodríguez', specialty: 'Esteticista', services: [3, 4] },
  { id: 4, name: 'Javier Morales', specialty: 'Estilista Completo', services: [1, 2, 3] }
];

const ReservaForm = () => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    serviceId: '',
    professionalId: '',
    date: '',
    time: ''
  });
  
  const [availableProfessionals, setAvailableProfessionals] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Hook personalizado para reservas
  const { 
    loading, 
    error: apiError, 
    mockCreateReservation, 
    clearError 
  } = useReservas();

  // Filtrar profesionales disponibles según el servicio seleccionado
  useEffect(() => {
    if (formData.serviceId) {
      const filtered = mockProfessionals.filter(prof => 
        prof.services.includes(parseInt(formData.serviceId))
      );
      setAvailableProfessionals(filtered);
      
      // Reset professional if not available for selected service
      if (formData.professionalId && !filtered.find(p => p.id === parseInt(formData.professionalId))) {
        setFormData(prev => ({ ...prev, professionalId: '' }));
      }
    } else {
      setAvailableProfessionals([]);
      setFormData(prev => ({ ...prev, professionalId: '' }));
    }
  }, [formData.serviceId]);

  // Manejar cambios en los campos del formulario
  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario lo modifica
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
    clearError();
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};
    
    if (!formData.serviceId) {
      errors.serviceId = 'El servicio es obligatorio';
    }
    
    if (!formData.professionalId) {
      errors.professionalId = 'El profesional es obligatorio';
    }
    
    if (!formData.date) {
      errors.date = 'La fecha es obligatoria';
    }
    
    if (!formData.time) {
      errors.time = 'La hora es obligatoria';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Preparar datos para enviar al backend
      const reservationData = {
        serviceId: parseInt(formData.serviceId),
        professionalId: parseInt(formData.professionalId),
        date: formData.date,
        time: formData.time
      };

      // Enviar al backend (usando mock por ahora)
      const result = await mockCreateReservation(reservationData);
      
      console.log('Reserva creada:', result);
      
      // Mostrar mensaje de éxito
      setShowSuccess(true);
      
      // Limpiar formulario
      setFormData({
        serviceId: '',
        professionalId: '',
        date: '',
        time: ''
      });
      
    } catch (error) {
      console.error('Error al crear reserva:', error);
      // El error se maneja automáticamente por el hook useReservas
    }
  };

  const selectedService = mockServices.find(s => s.id === parseInt(formData.serviceId));

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Reservar Cita
        </Typography>
        
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Complete todos los campos para reservar su cita
        </Typography>

        {/* Mostrar errores de API */}
        {apiError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {apiError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          {/* Dropdown para seleccionar servicio */}
          <FormControl fullWidth margin="normal" error={!!formErrors.serviceId}>
            <InputLabel id="service-label">Servicio</InputLabel>
            <Select
              labelId="service-label"
              id="service-select"
              value={formData.serviceId}
              label="Servicio"
              onChange={handleChange('serviceId')}
            >
              {mockServices.map((service) => (
                <MenuItem key={service.id} value={service.id}>
                  {service.name} - €{service.price} ({service.duration} min)
                </MenuItem>
              ))}
            </Select>
            {formErrors.serviceId && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {formErrors.serviceId}
              </Typography>
            )}
          </FormControl>

          {/* Dropdown para seleccionar profesional */}
          <FormControl fullWidth margin="normal" error={!!formErrors.professionalId}>
            <InputLabel id="professional-label">Profesional</InputLabel>
            <Select
              labelId="professional-label"
              id="professional-select"
              value={formData.professionalId}
              label="Profesional"
              onChange={handleChange('professionalId')}
              disabled={!formData.serviceId}
            >
              {availableProfessionals.map((professional) => (
                <MenuItem key={professional.id} value={professional.id}>
                  {professional.name} - {professional.specialty}
                </MenuItem>
              ))}
            </Select>
            {formErrors.professionalId && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {formErrors.professionalId}
              </Typography>
            )}
            {!formData.serviceId && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Seleccione primero un servicio
              </Typography>
            )}
          </FormControl>

          {/* Selector de fecha */}
          <TextField
            fullWidth
            margin="normal"
            id="date"
            label="Fecha"
            type="date"
            value={formData.date}
            onChange={handleChange('date')}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: new Date().toISOString().split('T')[0], // No permitir fechas pasadas
            }}
            error={!!formErrors.date}
            helperText={formErrors.date}
          />

          {/* Selector de hora */}
          <TextField
            fullWidth
            margin="normal"
            id="time"
            label="Hora"
            type="time"
            value={formData.time}
            onChange={handleChange('time')}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              step: 1800, // 30 minutos
            }}
            error={!!formErrors.time}
            helperText={formErrors.time}
          />

          {/* Resumen de la selección */}
          {selectedService && formData.professionalId && formData.date && formData.time && (
            <Paper variant="outlined" sx={{ p: 2, mt: 3, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom>
                Resumen de la Cita
              </Typography>
              <Typography variant="body2">
                <strong>Servicio:</strong> {selectedService.name}
              </Typography>
              <Typography variant="body2">
                <strong>Profesional:</strong> {availableProfessionals.find(p => p.id === parseInt(formData.professionalId))?.name}
              </Typography>
              <Typography variant="body2">
                <strong>Fecha:</strong> {new Date(formData.date + 'T00:00').toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Typography>
              <Typography variant="body2">
                <strong>Hora:</strong> {formData.time}
              </Typography>
              <Typography variant="body2">
                <strong>Duración:</strong> {selectedService.duration} minutos
              </Typography>
              <Typography variant="body2">
                <strong>Precio:</strong> €{selectedService.price}
              </Typography>
            </Paper>
          )}

          {/* Botón de confirmación */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, py: 1.5 }}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Procesando...' : 'Confirmar Reserva'}
          </Button>
        </Box>

        {/* Snackbar para mensaje de éxito */}
        <Snackbar
          open={showSuccess}
          autoHideDuration={6000}
          onClose={() => setShowSuccess(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setShowSuccess(false)} 
            severity="success" 
            sx={{ width: '100%' }}
          >
            ¡Reserva creada exitosamente! Te hemos enviado una confirmación por email.
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default ReservaForm; 