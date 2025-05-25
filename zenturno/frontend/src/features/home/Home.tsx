import React from 'react';
import { Container, Typography, Button, Box, Grid, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Bienvenido a ZenTurno
        </Typography>
        <Typography variant="h5" component="h2" align="center" color="textSecondary" paragraph>
          Sistema de gestión de turnos y citas
        </Typography>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button 
            component={RouterLink} 
            to="/appointments/book" 
            variant="contained" 
            color="primary" 
            size="large"
            sx={{ mx: 2 }}
          >
            Reservar Cita
          </Button>
          <Button 
            component={RouterLink} 
            to="/appointments/my" 
            variant="outlined" 
            color="primary" 
            size="large"
            sx={{ mx: 2 }}
          >
            Mis Citas
          </Button>
        </Box>
        
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" component="h3" gutterBottom>
                Reserva Fácilmente
              </Typography>
              <Typography variant="body1">
                Reserva tus citas de forma rápida y sencilla desde cualquier dispositivo. Elige el profesional, 
                la fecha y la hora que mejor se adapte a tus necesidades.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" component="h3" gutterBottom>
                Gestiona tus Citas
              </Typography>
              <Typography variant="body1">
                Visualiza todas tus citas programadas, recibe recordatorios y realiza modificaciones o cancelaciones 
                cuando lo necesites.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" component="h3" gutterBottom>
                Servicio Personalizado
              </Typography>
              <Typography variant="body1">
                Nuestro sistema te permite guardar tus preferencias y acceder a un historial completo de tus 
                visitas anteriores.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home; 