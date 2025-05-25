import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
const Home = React.lazy(() => import('./features/home/Home'));
const Login = React.lazy(() => import('./features/auth/Login'));
const Register = React.lazy(() => import('./features/auth/Register'));
const BookAppointment = React.lazy(() => import('./features/appointments/BookAppointment'));
const MyAppointments = React.lazy(() => import('./features/appointments/MyAppointments'));
const NotFound = React.lazy(() => import('./features/errors/NotFound'));

const App: React.FC = () => {
  return (
    <React.Suspense fallback={<div>Cargando...</div>}>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rutas con layout principal */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="appointments/book" element={<BookAppointment />} />
          <Route path="appointments/my" element={<MyAppointments />} />
        </Route>
        
        {/* Página 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </React.Suspense>
  );
};

export default App; 