import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define la API base
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
    prepareHeaders: (headers, { getState }) => {
      // Obtiene el token del estado de la aplicación
      const token = (getState() as any).auth.token;
      
      // Si tenemos un token, lo añadimos a los headers
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  tagTypes: ['Appointments', 'User', 'Professionals', 'Services'],
  endpoints: () => ({}),
});

// Exportar los hooks generados automáticamente
export const {
  // No hay endpoints iniciales
} = api; 