import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormHelperText
} from '@mui/material';
import { format, addDays, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useReservas } from '../../hooks/useReservas';
import '../../styles/ReservaForm.css';

// Tipos para el formulario
interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
  description: string;
}

interface Professional {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  services: number[];
}

interface AppointmentForm {
  serviceId: number | null;
  professionalId: number | null;
  date: Date | null;
  time: Date | null;
  clientNotes: string;
}

const steps = ['Seleccionar Servicio', 'Elegir Profesional', 'Seleccionar Fecha y Hora', 'Confirmar Cita'];

// Datos simulados (en una aplicación real vendrían del backend)
const mockServices: Service[] = [
  { id: 1, name: 'Corte de Cabello', duration: 30, price: 25, description: 'Corte moderno y personalizado' },
  { id: 2, name: 'Tinte y Peinado', duration: 90, price: 60, description: 'Coloración completa con peinado' },
  { id: 3, name: 'Manicura', duration: 45, price: 20, description: 'Cuidado completo de uñas' },
  { id: 4, name: 'Tratamiento Facial', duration: 60, price: 45, description: 'Limpieza y hidratación facial' },
];

const mockProfessionals: Professional[] = [
  { id: 1, name: 'Ana García', specialty: 'Estilista Senior', rating: 4.8, services: [1, 2] },
  { id: 2, name: 'Carlos López', specialty: 'Barbero Especialista', rating: 4.9, services: [1] },
  { id: 3, name: 'María Rodríguez', specialty: 'Esteticista', rating: 4.7, services: [3, 4] },
  { id: 4, name: 'Javier Morales', specialty: 'Estilista Completo', rating: 4.6, services: [1, 2, 3] },
];

const availableTimeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
];

const BookAppointment: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<AppointmentForm>({
    serviceId: null,
    professionalId: null,
    date: null,
    time: null,
    clientNotes: ''
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [availableProfessionals, setAvailableProfessionals] = useState<Professional[]>([]);

  // Usar el hook personalizado para las reservas
  const { 
    loading, 
    error: apiError, 
    mockCreateReservation, 
    clearError 
  } = useReservas();

  // Combinar errores locales y de API
  const error = localError || apiError;

  // Actualizar profesionales disponibles cuando se selecciona un servicio
  useEffect(() => {
    if (formData.serviceId) {
      const filtered = mockProfessionals.filter(prof => 
        prof.services.includes(formData.serviceId!)
      );
      setAvailableProfessionals(filtered);
      
      // Reset professional if not available for selected service
      if (formData.professionalId && !filtered.find(p => p.id === formData.professionalId)) {
        setFormData(prev => ({ ...prev, professionalId: null }));
      }
    }
  }, [formData.serviceId]);

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setLocalError(null);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setLocalError(null);
  };

  const handleReset = () => {
    setActiveStep(0);
    setFormData({
      serviceId: null,
      professionalId: null,
      date: null,
      time: null,
      clientNotes: ''
    });
    setLocalError(null);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        if (!formData.serviceId) {
          setLocalError('Por favor selecciona un servicio');
          return false;
        }
        break;
      case 1:
        if (!formData.professionalId) {
          setLocalError('Por favor selecciona un profesional');
          return false;
        }
        break;
      case 2:
        if (!formData.date || !formData.time) {
          setLocalError('Por favor selecciona fecha y hora');
          return false;
        }
        break;
    }
    return true;
  };

  const handleServiceSelect = (serviceId: number) => {
    setFormData(prev => ({ ...prev, serviceId }));
  };

  const handleProfessionalSelect = (professionalId: number) => {
    setFormData(prev => ({ ...prev, professionalId }));
  };

  const handleDateSelect = (date: Date | null) => {
    setFormData(prev => ({ ...prev, date }));
  };

  const handleTimeSelect = (timeSlot: string) => {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const timeDate = new Date();
    timeDate.setHours(hours, minutes, 0, 0);
    setFormData(prev => ({ ...prev, time: timeDate }));
  };

  const handleConfirmReservation = async () => {
    try {
      clearError();
      setLocalError(null);

      // Preparar datos para enviar al backend
      const reservationData = {
        serviceId: formData.serviceId,
        professionalId: formData.professionalId,
        date: formData.date ? format(formData.date, 'yyyy-MM-dd') : null,
        time: formData.time ? format(formData.time, 'HH:mm') : null,
        clientNotes: formData.clientNotes
      };

      // Usar la función mock por ahora (cambiar por createReservation cuando esté el backend)
      const result = await mockCreateReservation(reservationData);
      
      console.log('Reserva creada exitosamente:', result);
      setActiveStep(steps.length);
      setConfirmDialogOpen(false);
    } catch (err) {
      console.error('Error al crear reserva:', err);
      // El error ya se maneja en el hook
    }
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Hoy';
    if (isTomorrow(date)) return 'Mañana';
    return format(date, 'EEEE dd/MM', { locale: es });
  };

  const selectedService = mockServices.find(s => s.id === formData.serviceId);
  const selectedProfessional = mockProfessionals.find(p => p.id === formData.professionalId);

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              ¿Qué servicio necesitas?
            </Typography>
            <Grid container spacing={2}>
              {mockServices.map((service) => (
                <Grid item xs={12} sm={6} key={service.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: formData.serviceId === service.id ? 2 : 1,
                      borderColor: formData.serviceId === service.id ? 'primary.main' : 'grey.300',
                      '&:hover': { borderColor: 'primary.main' }
                    }}
                  >
                    <CardActionArea onClick={() => handleServiceSelect(service.id)}>
                      <CardContent>
                        <Typography variant="h6" component="div">
                          {service.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {service.description}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip 
                            icon={<AccessTimeIcon />} 
                            label={`${service.duration} min`} 
                            size="small" 
                            variant="outlined"
                          />
                          <Typography variant="h6" color="primary">
                            €{service.price}
                          </Typography>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Elige tu profesional preferido
            </Typography>
            <Grid container spacing={2}>
              {availableProfessionals.map((professional) => (
                <Grid item xs={12} sm={6} key={professional.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: formData.professionalId === professional.id ? 2 : 1,
                      borderColor: formData.professionalId === professional.id ? 'primary.main' : 'grey.300',
                      '&:hover': { borderColor: 'primary.main' }
                    }}
                  >
                    <CardActionArea onClick={() => handleProfessionalSelect(professional.id)}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="h6" component="div">
                            {professional.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {professional.specialty}
                        </Typography>
                        <Chip 
                          label={`⭐ ${professional.rating}`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Selecciona fecha y hora
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Fecha
                </Typography>
                <TextField
                  type="date"
                  value={formData.date ? format(formData.date, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const dateValue = e.target.value;
                    if (dateValue) {
                      handleDateSelect(new Date(dateValue));
                    } else {
                      handleDateSelect(null);
                    }
                  }}
                  inputProps={{
                    min: format(new Date(), 'yyyy-MM-dd'),
                    max: format(addDays(new Date(), 30), 'yyyy-MM-dd')
                  }}
                  fullWidth
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Hora disponible
                  {formData.date && (
                    <Typography component="span" variant="body2" color="text.secondary">
                      {' '}para {getDateLabel(formData.date)}
                    </Typography>
                  )}
                </Typography>
                {formData.date ? (
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    {availableTimeSlots.map((timeSlot) => (
                      <Grid item xs={4} key={timeSlot}>
                        <Button
                          variant={formData.time && format(formData.time, 'HH:mm') === timeSlot ? 'contained' : 'outlined'}
                          size="small"
                          fullWidth
                          onClick={() => handleTimeSelect(timeSlot)}
                          sx={{ mb: 1 }}
                        >
                          {timeSlot}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Selecciona una fecha para ver los horarios disponibles
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Confirma los detalles de tu cita
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Servicio
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {selectedService?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedService?.duration} min • €{selectedService?.price}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Profesional
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {selectedProfessional?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedProfessional?.specialty}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha
                  </Typography>
                  <Typography variant="body1">
                    {formData.date && format(formData.date, 'EEEE, dd MMMM yyyy', { locale: es })}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Hora
                  </Typography>
                  <Typography variant="body1">
                    {formData.time && format(formData.time, 'HH:mm')}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notas adicionales (opcional)"
              placeholder="¿Tienes alguna preferencia especial o comentario?"
              value={formData.clientNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, clientNotes: e.target.value }))}
              sx={{ mb: 2 }}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Reservar Cita
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {activeStep === steps.length ? (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom color="success.main">
              ¡Cita reservada con éxito!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Hemos enviado la confirmación de tu cita a tu correo electrónico.
              Te recordaremos 24 horas antes de tu cita.
            </Typography>
            <Button 
              variant="contained" 
              onClick={handleReset} 
              sx={{ mt: 2 }}
            >
              Reservar otra cita
            </Button>
          </Box>
        ) : (
          <>
            {renderStepContent(activeStep)}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ ml: 1 }}
              >
                Atrás
              </Button>
              <Button
                variant="contained"
                onClick={activeStep === steps.length - 1 ? () => setConfirmDialogOpen(true) : handleNext}
                sx={{ ml: 1 }}
              >
                {activeStep === steps.length - 1 ? 'Confirmar Cita' : 'Siguiente'}
              </Button>
            </Box>
          </>
        )}
      </Paper>

      {/* Dialog de confirmación */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          ¿Confirmar reserva?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Estás a punto de confirmar tu cita con los siguientes detalles:
          </Typography>
          <Typography variant="body2">
            <strong>Servicio:</strong> {selectedService?.name}<br />
            <strong>Profesional:</strong> {selectedProfessional?.name}<br />
            <strong>Fecha:</strong> {formData.date && format(formData.date, 'dd/MM/yyyy')}<br />
            <strong>Hora:</strong> {formData.time && format(formData.time, 'HH:mm')}<br />
            <strong>Precio:</strong> €{selectedService?.price}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmReservation} 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Procesando...' : 'Confirmar Cita'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookAppointment; 