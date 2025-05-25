import React from 'react';
import { Container, Typography, Paper, Box, Stepper, Step, StepLabel, Button } from '@mui/material';

const steps = ['Seleccionar Servicio', 'Elegir Profesional', 'Seleccionar Fecha y Hora', 'Confirmar Cita'];

const BookAppointment: React.FC = () => {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom>
              Seleccione el tipo de servicio
            </Typography>
            <Typography variant="body1">
              Esta sección mostraría una lista de servicios disponibles para seleccionar.
            </Typography>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom>
              Seleccione el profesional
            </Typography>
            <Typography variant="body1">
              Esta sección mostraría una lista de profesionales disponibles para el servicio seleccionado.
            </Typography>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom>
              Seleccione fecha y hora
            </Typography>
            <Typography variant="body1">
              Esta sección mostraría un calendario y horarios disponibles para el profesional seleccionado.
            </Typography>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom>
              Confirme su cita
            </Typography>
            <Typography variant="body1">
              Esta sección mostraría un resumen de la cita seleccionada para confirmar.
            </Typography>
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

        {activeStep === steps.length ? (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              ¡Cita reservada con éxito!
            </Typography>
            <Typography variant="body1">
              Hemos enviado la confirmación de su cita a su correo electrónico.
            </Typography>
            <Button onClick={handleReset} sx={{ mt: 3 }}>
              Reservar otra cita
            </Button>
          </Box>
        ) : (
          <>
            {renderStepContent(activeStep)}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mt: 3, ml: 1 }}
              >
                Atrás
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{ mt: 3, ml: 1 }}
              >
                {activeStep === steps.length - 1 ? 'Confirmar Cita' : 'Siguiente'}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default BookAppointment; 