import React from 'react';
import { Container, Typography, Paper, Box, Tabs, Tab, List, ListItem, ListItemText, Chip, Divider, Button } from '@mui/material';

interface Appointment {
  id: string;
  service: string;
  professional: string;
  date: string;
  time: string;
  status: 'pending' | 'completed' | 'cancelled';
}

const MyAppointments: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);

  // Datos de ejemplo
  const appointments: Appointment[] = [
    {
      id: '1',
      service: 'Consulta General',
      professional: 'Dr. Juan Pérez',
      date: '28/05/2025',
      time: '10:00 AM',
      status: 'pending'
    },
    {
      id: '2',
      service: 'Evaluación Psicológica',
      professional: 'Dra. Ana García',
      date: '30/05/2025',
      time: '15:30 PM',
      status: 'pending'
    },
    {
      id: '3',
      service: 'Terapia Física',
      professional: 'Dr. Carlos López',
      date: '15/05/2025',
      time: '09:00 AM',
      status: 'completed'
    },
    {
      id: '4',
      service: 'Consulta Nutrición',
      professional: 'Dra. María Rodríguez',
      date: '10/05/2025',
      time: '16:00 PM',
      status: 'cancelled'
    }
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getFilteredAppointments = () => {
    switch (tabValue) {
      case 0: // Todas
        return appointments;
      case 1: // Pendientes
        return appointments.filter(app => app.status === 'pending');
      case 2: // Completadas
        return appointments.filter(app => app.status === 'completed');
      case 3: // Canceladas
        return appointments.filter(app => app.status === 'cancelled');
      default:
        return appointments;
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'pending':
        return <Chip label="Pendiente" color="primary" size="small" />;
      case 'completed':
        return <Chip label="Completada" color="success" size="small" />;
      case 'cancelled':
        return <Chip label="Cancelada" color="error" size="small" />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Mis Citas
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="appointment tabs">
            <Tab label="Todas" />
            <Tab label="Pendientes" />
            <Tab label="Completadas" />
            <Tab label="Canceladas" />
          </Tabs>
        </Box>
        
        <List>
          {getFilteredAppointments().length > 0 ? (
            getFilteredAppointments().map((appointment, index) => (
              <React.Fragment key={appointment.id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" component="span">
                          {appointment.service}
                        </Typography>
                        {getStatusChip(appointment.status)}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span" color="text.primary">
                          {`${appointment.professional} · ${appointment.date} · ${appointment.time}`}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {appointment.status === 'pending' && (
                            <>
                              <Button size="small" variant="outlined" color="primary" sx={{ mr: 1 }}>
                                Reprogramar
                              </Button>
                              <Button size="small" variant="outlined" color="error">
                                Cancelar
                              </Button>
                            </>
                          )}
                        </Box>
                      </>
                    }
                  />
                </ListItem>
                {index < getFilteredAppointments().length - 1 && <Divider />}
              </React.Fragment>
            ))
          ) : (
            <Box sx={{ py: 2, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No hay citas para mostrar
              </Typography>
            </Box>
          )}
        </List>
      </Paper>
    </Container>
  );
};

export default MyAppointments; 