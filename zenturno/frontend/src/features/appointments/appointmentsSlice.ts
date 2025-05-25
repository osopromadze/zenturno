import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define los tipos para las citas
export interface Appointment {
  id: number;
  date: string;
  time: string;
  serviceId: number;
  serviceName: string;
  professionalId: number;
  professionalName: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

interface AppointmentsState {
  appointments: Appointment[];
  selectedAppointment: Appointment | null;
  isLoading: boolean;
  error: string | null;
}

// Estado inicial
const initialState: AppointmentsState = {
  appointments: [],
  selectedAppointment: null,
  isLoading: false,
  error: null,
};

// Crear el slice
const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    fetchAppointmentsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchAppointmentsSuccess: (state, action: PayloadAction<Appointment[]>) => {
      state.isLoading = false;
      state.appointments = action.payload;
    },
    fetchAppointmentsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    selectAppointment: (state, action: PayloadAction<Appointment>) => {
      state.selectedAppointment = action.payload;
    },
    clearSelectedAppointment: (state) => {
      state.selectedAppointment = null;
    },
    createAppointmentSuccess: (state, action: PayloadAction<Appointment>) => {
      state.appointments.push(action.payload);
    },
    updateAppointmentSuccess: (state, action: PayloadAction<Appointment>) => {
      const index = state.appointments.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.appointments[index] = action.payload;
      }
    },
    cancelAppointmentSuccess: (state, action: PayloadAction<number>) => {
      const index = state.appointments.findIndex(a => a.id === action.payload);
      if (index !== -1) {
        state.appointments[index].status = 'cancelled';
      }
    },
  },
});

// Exportar acciones y reducer
export const {
  fetchAppointmentsStart,
  fetchAppointmentsSuccess,
  fetchAppointmentsFailure,
  selectAppointment,
  clearSelectedAppointment,
  createAppointmentSuccess,
  updateAppointmentSuccess,
  cancelAppointmentSuccess,
} = appointmentsSlice.actions;

export default appointmentsSlice.reducer; 