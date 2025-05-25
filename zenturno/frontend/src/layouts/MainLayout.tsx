import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const MainLayout: React.FC = () => {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography 
            variant="h6" 
            component={RouterLink} 
            to="/"
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit' 
            }}
          >
            ZenTurno
          </Typography>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/appointments/book"
          >
            Reservar
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/appointments/my"
          >
            Mis Citas
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/login"
          >
            Iniciar Sesión
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Outlet />
      </Container>
      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          mt: 'auto', 
          backgroundColor: (theme) => theme.palette.grey[200]
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} ZenTurno - Sistema de Gestión de Turnos
          </Typography>
        </Container>
      </Box>
    </>
  );
};

export default MainLayout; 