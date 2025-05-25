import { createTheme } from '@mui/material/styles';

// Define los colores principales basados en la descripción del proyecto
const theme = createTheme({
  palette: {
    primary: {
      main: '#30B4C5', // Azul turquesa - Transmite calma, confianza y profesionalismo
      light: '#63e6ff',
      dark: '#008494',
    },
    secondary: {
      main: '#88D498', // Verde menta - Representa frescura y bienestar
      light: '#bbffca',
      dark: '#57a269',
    },
    error: {
      main: '#FF6B6B',
    },
    warning: {
      main: '#F0A202', // Amarillo ámbar - Destaca acciones importantes
    },
    info: {
      main: '#30B4C5',
    },
    success: {
      main: '#88D498',
    },
    background: {
      default: '#F5F5F5', // Gris muy claro
      paper: '#FFFFFF',
    },
    text: {
      primary: '#424242', // Gris oscuro
      secondary: '#757575', // Gris medio
    },
  },
  typography: {
    fontFamily: '"Montserrat", "Open Sans", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
      fontSize: '2rem',
    },
    h2: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h3: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h4: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h5: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
      fontSize: '1.1rem',
    },
    h6: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
      fontSize: '1rem',
    },
    body1: {
      fontFamily: '"Open Sans", sans-serif',
      fontSize: '1rem',
    },
    body2: {
      fontFamily: '"Open Sans", sans-serif',
      fontSize: '0.875rem',
    },
    button: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25,
          padding: '8px 24px',
          boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme; 