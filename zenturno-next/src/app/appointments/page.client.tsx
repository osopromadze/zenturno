"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';

// Define types for our data
interface Professional {
  id: number;
  name: string;
  specialty?: string;
  user_id: string;
}

interface Client {
  id: number;
  name: string;
  phone?: string;
  user_id: string;
}

interface Service {
  id: number;
  name: string;
  price: number;
  duration_minutes: number;
}

interface Appointment {
  id: number;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  client_id: number;
  professional_id: number;
  service_id: number;
  clients?: Client;
  professionals?: Professional;
  services?: Service;
}

// Component for appointment actions
interface AppointmentActionsProps {
  appointmentId: number;
  status: string;
  canReschedule: boolean;
  userRole: string;
}

const AppointmentActions = ({ appointmentId, status, canReschedule, userRole }: AppointmentActionsProps) => {
  // We'll implement the actual actions later
  return (
    <div className="flex flex-wrap gap-2">
      {status === 'pending' && (
        <>
          <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
            Confirm
          </button>
          <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
            Cancel
          </button>
        </>
      )}
      {status === 'confirmed' && (
        <>
          <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
            Complete
          </button>
          <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
            Cancel
          </button>
        </>
      )}
      {canReschedule && (
        <Link href={`/appointments/reschedule/${appointmentId}`} className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700">
          Reschedule
        </Link>
      )}
      <Link href={`/appointments/${appointmentId}`} className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">
        Details
      </Link>
    </div>
  );
};

// Appointment card component
interface AppointmentCardProps {
  appointment: Appointment;
  userRole: string;
}

const AppointmentCard = ({ appointment, userRole }: AppointmentCardProps) => {
  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  const canReschedule = ['pending', 'confirmed'].includes(appointment.status);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div>
          <h3 className="text-xl font-semibold">
            {appointment.services?.name || 'Unknown Service'}
          </h3>
          <p className="text-gray-600">
            {formatDateTime(appointment.date)}
          </p>
          
          {userRole === 'client' && appointment.professionals && (
            <p className="mt-2">
              <span className="text-gray-600">Professional:</span>{' '}
              <span className="font-medium">{appointment.professionals.name}</span>
              {appointment.professionals.specialty && (
                <span className="text-gray-600 ml-1">
                  ({appointment.professionals.specialty})
                </span>
              )}
            </p>
          )}
          
          {(userRole === 'professional' || userRole === 'admin') && appointment.clients && (
            <p className="mt-2">
              <span className="text-gray-600">Client:</span>{' '}
              <span className="font-medium">{appointment.clients.name}</span>
              {appointment.clients.phone && (
                <span className="text-gray-600 ml-1">
                  ({appointment.clients.phone})
                </span>
              )}
            </p>
          )}
          
          {appointment.services && (
            <p className="mt-2">
              <span className="text-gray-600">Service:</span>{' '}
              <span className="font-medium">{appointment.services.name}</span>
              <span className="text-gray-600 ml-1">
                ({appointment.services.duration_minutes} min, 
                ${appointment.services.price})
              </span>
            </p>
          )}
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize
            ${appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
            ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
            ${appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
            ${appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
          `}>
            {appointment.status}
          </span>
          
          <div className="mt-4">
            <AppointmentActions
              appointmentId={appointment.id}
              status={appointment.status}
              canReschedule={canReschedule}
              userRole={userRole}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AppointmentsClientPage() {
  const { session, userProfile, role, isLoading, error } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') || 'all';
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [fetchingAppointments, setFetchingAppointments] = useState(false);
  const [appointmentError, setAppointmentError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/login?redirect=/appointments');
    }
  }, [isLoading, session, router]);
  
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!session || !userProfile || !role) return;
      
      setFetchingAppointments(true);
      setAppointmentError(null);
      
      try {
        const supabase = createClient();
        
        // Get client or professional ID based on role
        let clientId = null;
        let professionalId = null;
        
        if (role === 'client') {
          const { data: clientData } = await supabase
            .from('clients')
            .select('id')
            .eq('user_id', userProfile.id)
            .single();
          
          clientId = clientData?.id;
          
          // If client doesn't exist, create one
          if (!clientData) {
            const { data: newClient, error: createClientError } = await supabase
              .from('clients')
              .insert({
                user_id: userProfile.id
              })
              .select('id')
              .single();
            
            if (!createClientError) {
              clientId = newClient.id;
            }
          }
        } else if (role === 'professional') {
          const { data: professionalData } = await supabase
            .from('professionals')
            .select('id')
            .eq('user_id', userProfile.id)
            .single();
          
          professionalId = professionalData?.id;
          
          // If professional doesn't exist, create one
          if (!professionalData) {
            const { data: newProfessional, error: createProfessionalError } = await supabase
              .from('professionals')
              .insert({
                user_id: userProfile.id
              })
              .select('id')
              .single();
            
            if (!createProfessionalError) {
              professionalId = newProfessional.id;
            }
          }
        }
        
        // Fetch appointments based on role
        if (role === 'client' && clientId) {
          let query = supabase
            .from('appointments')
            .select(`
              *,
              professionals:professional_id(*),
              services:service_id(*)
            `)
            .eq('client_id', clientId)
            .order('date', { ascending: true });
          
          // Apply status filter if not 'all'
          if (statusFilter !== 'all') {
            query = query.eq('status', statusFilter);
          }
          
          const { data, error } = await query;
          
          if (error) {
            throw new Error(error.message);
          } else {
            setAppointments(data || []);
          }
        } else if (role === 'professional' && professionalId) {
          let query = supabase
            .from('appointments')
            .select(`
              *,
              clients:client_id(*),
              services:service_id(*)
            `)
            .eq('professional_id', professionalId)
            .order('date', { ascending: true });
          
          // Apply status filter if not 'all'
          if (statusFilter !== 'all') {
            query = query.eq('status', statusFilter);
          }
          
          const { data, error } = await query;
          
          if (error) {
            throw new Error(error.message);
          } else {
            setAppointments(data || []);
          }
        } else if (role === 'admin') {
          let query = supabase
            .from('appointments')
            .select(`
              *,
              clients:client_id(*),
              professionals:professional_id(*),
              services:service_id(*)
            `)
            .order('date', { ascending: true });
          
          // Apply status filter if not 'all'
          if (statusFilter !== 'all') {
            query = query.eq('status', statusFilter);
          }
          
          const { data, error } = await query;
          
          if (error) {
            throw new Error(error.message);
          } else {
            setAppointments(data || []);
          }
        }
      } catch (err: unknown) {
        console.error('Error fetching appointments:', err);
        setAppointmentError(
          err instanceof Error ? err.message : 'Failed to fetch appointments'
        );
      } finally {
        setFetchingAppointments(false);
      }
    };
    
    if (session && userProfile && role) {
      fetchAppointments();
    }
  }, [session, userProfile, role, statusFilter]);
  
  // Show loading state
  if (isLoading || fetchingAppointments) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Show error state
  if (error || appointmentError) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Appointments</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || appointmentError || "Error loading appointments. Please try again later."}
          </div>
        </div>
      </div>
    );
  }
  
  // If not logged in (should be handled by useEffect redirect, but just in case)
  if (!session) {
    return null;
  }
  
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Appointments</h1>
          <div className="flex space-x-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Dashboard
            </Link>
            {role === 'client' && (
              <Link
                href="/appointments/book"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Book Appointment
              </Link>
            )}
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <Link
              href="/appointments"
              className={`px-4 py-2 rounded-md ${
                statusFilter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              All
            </Link>
            <Link
              href="/appointments?status=pending"
              className={`px-4 py-2 rounded-md ${
                statusFilter === 'pending'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Pending
            </Link>
            <Link
              href="/appointments?status=confirmed"
              className={`px-4 py-2 rounded-md ${
                statusFilter === 'confirmed'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Confirmed
            </Link>
            <Link
              href="/appointments?status=completed"
              className={`px-4 py-2 rounded-md ${
                statusFilter === 'completed'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Completed
            </Link>
            <Link
              href="/appointments?status=cancelled"
              className={`px-4 py-2 rounded-md ${
                statusFilter === 'cancelled'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Cancelled
            </Link>
          </div>
        </div>
        
        {appointments.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-600">
              No appointments found.
              {role === 'client' && (
                <Link href="/appointments/book" className="text-blue-600 ml-1 hover:underline font-medium">
                  Book an appointment
                </Link>
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <AppointmentCard 
                key={appointment.id} 
                appointment={appointment}
                userRole={role}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
