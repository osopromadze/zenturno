"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { redirect } from 'next/navigation';

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
        <Link href={`/appointments/${appointmentId}/reschedule`} className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700">
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

export default function AppointmentsPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { session, userProfile, role, isLoading, error } = useAuth();
  const router = useRouter();
  const statusFilter = searchParams.get('status') || 'all';
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [fetchingAppointments, setFetchingAppointments] = useState(false);
  const [appointmentError, setAppointmentError] = useState<string | null>(null);
  
  // Handle redirect for exact /appointments path
  useEffect(() => {
    // Only redirect if the path is exactly /appointments
    // Don't redirect child routes like /appointments/book
    if (pathname === '/appointments' && !pathname.startsWith('/appointments/')) {
      // Preserve any query parameters when redirecting
      const message = searchParams.get('message');
      const status = searchParams.get('status');
      
      let redirectUrl = '/dashboard/appointments';
      const params = new URLSearchParams();
      
      if (message) {
        params.set('message', message);
      }
      
      if (status) {
        params.set('status', status);
      }
      
      const queryString = params.toString();
      if (queryString) {
        redirectUrl += `?${queryString}`;
      }
      
      redirect(redirectUrl);
    }
  }, [pathname, searchParams]);
  
  // Handle authentication
  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/login?redirect=/appointments');
    }
  }, [isLoading, session, router]);
  
  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!session || !userProfile || !role || pathname === '/appointments' || pathname.startsWith('/appointments/')) return;
      
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
        } else if (role === 'professional') {
          const { data: professionalData } = await supabase
            .from('professionals')
            .select('id')
            .eq('user_id', userProfile.id)
            .single();
          
          professionalId = professionalData?.id;
        }
        
        // Build query based on role
        let query;
        
        if (role === 'client' && clientId) {
          query = supabase
            .from('appointments')
            .select(`
              *,
              professionals (*),
              services (*)
            `)
            .eq('client_id', clientId);
        } else if (role === 'professional' && professionalId) {
          query = supabase
            .from('appointments')
            .select(`
              *,
              clients (*),
              services (*)
            `)
            .eq('professional_id', professionalId);
        } else if (role === 'admin') {
          query = supabase
            .from('appointments')
            .select(`
              *,
              clients (*),
              professionals (*),
              services (*)
            `);
        } else {
          throw new Error('Unable to determine user role or ID');
        }
        
        // Apply status filter if not 'all'
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }
        
        // Order by date
        query = query.order('date', { ascending: true });
        
        const { data, error } = await query;
        
        if (error) {
          throw new Error(error.message);
        } else {
          setAppointments(data || []);
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
    
    fetchAppointments();
  }, [session, userProfile, role, statusFilter, pathname]);
  
  // If we're on the exact /appointments path, show loading spinner while redirecting
  if (pathname === '/appointments' && !pathname.startsWith('/appointments/')) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // For child routes like /appointments/book, the component will just render nothing
  // and let the child route's page component handle the rendering
  if (pathname.startsWith('/appointments/')) {
    return null;
  }
  
  // Default case - should not reach here but added for safety
  return null;
}
