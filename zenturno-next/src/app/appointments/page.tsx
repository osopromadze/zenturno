import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Appointment } from '@/domain/appointment/Appointment';
import { UserRole } from '@/domain/user/UserRole';
import { Professional } from '@/domain/professional/Professional';
import { Client } from '@/domain/client/Client';
import { Service } from '@/domain/service/Service';

export default async function AppointmentsPage({
  searchParams
}: {
  searchParams: { status?: string }
}) {
  // Create Supabase client
  const supabase = createClient();
  
  // Check if user is logged in
  const { data: { session } } = await supabase.auth.getSession();
  
  // If user is not logged in, redirect to login
  if (!session) {
    redirect('/login?redirect=/appointments');
  }
  
  // Get user profile from database
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('email', session.user.email)
    .single();
  
  if (profileError) {
    console.error('Error fetching user profile:', profileError);
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Appointments</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error loading profile. Please try again later.
          </div>
        </div>
      </div>
    );
  }
  
  // Get user role
  const role = profile?.role || UserRole.CLIENT;
  
  // Filter by status if provided
  const statusFilter = searchParams.status || 'all';
  
  // Variables to store appointments and related data
  let appointments = [];
  let clientId = null;
  let professionalId = null;
  
  // Get client or professional ID based on role
  if (role === UserRole.CLIENT) {
    const { data: clientData } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', profile.id)
      .single();
    
    clientId = clientData?.id;
  } else if (role === UserRole.PROFESSIONAL) {
    const { data: professionalData } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', profile.id)
      .single();
    
    professionalId = professionalData?.id;
  }
  
  // Fetch appointments based on role
  if (role === UserRole.CLIENT && clientId) {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        professionals:professional_id(*),
        services:service_id(*)
      `)
      .eq('client_id', clientId)
      .order('date_time', { ascending: true });
    
    // Apply status filter if not 'all'
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching appointments:', error);
    } else {
      appointments = data || [];
    }
  } else if (role === UserRole.PROFESSIONAL && professionalId) {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        clients:client_id(*),
        services:service_id(*)
      `)
      .eq('professional_id', professionalId)
      .order('date_time', { ascending: true });
    
    // Apply status filter if not 'all'
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching appointments:', error);
    } else {
      appointments = data || [];
    }
  } else if (role === UserRole.ADMIN) {
    // Admins can see all appointments
    let query = supabase
      .from('appointments')
      .select(`
        *,
        clients:client_id(*),
        professionals:professional_id(*),
        services:service_id(*)
      `)
      .order('date_time', { ascending: true });
    
    // Apply status filter if not 'all'
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching appointments:', error);
    } else {
      appointments = data || [];
    }
  }
  
  // Convert database rows to domain entities
  const appointmentEntities = appointments.map((appointmentData) => {
    const appointment = Appointment.fromDatabaseRow(appointmentData);
    
    // Add related entities if available
    if (appointmentData.professionals) {
      const professional = Professional.fromDatabaseRow(appointmentData.professionals);
      // @ts-ignore - TypeScript doesn't know about our custom methods
      appointment.setProfessionalEntity(professional);
    }
    
    if (appointmentData.clients) {
      const client = Client.fromDatabaseRow(appointmentData.clients);
      // @ts-ignore - TypeScript doesn't know about our custom methods
      appointment.setClientEntity(client);
    }
    
    if (appointmentData.services) {
      const service = Service.fromDatabaseRow(appointmentData.services);
      // @ts-ignore - TypeScript doesn't know about our custom methods
      appointment.setServiceEntity(service);
    }
    
    return appointment;
  });
  
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Appointments</h1>
          <div className="flex space-x-4">
            <a 
              href="/dashboard" 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Dashboard
            </a>
            {role === UserRole.CLIENT && (
              <a 
                href="/appointments/book" 
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Book New Appointment
              </a>
            )}
          </div>
        </div>
        
        {/* Status filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <a 
              href="/appointments"
              className={`px-4 py-2 rounded-md ${statusFilter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              All
            </a>
            <a 
              href="/appointments?status=pending"
              className={`px-4 py-2 rounded-md ${statusFilter === 'pending' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              Pending
            </a>
            <a 
              href="/appointments?status=confirmed"
              className={`px-4 py-2 rounded-md ${statusFilter === 'confirmed' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              Confirmed
            </a>
            <a 
              href="/appointments?status=cancelled"
              className={`px-4 py-2 rounded-md ${statusFilter === 'cancelled' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              Cancelled
            </a>
            <a 
              href="/appointments?status=completed"
              className={`px-4 py-2 rounded-md ${statusFilter === 'completed' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              Completed
            </a>
          </div>
        </div>
        
        {/* Appointments list */}
        {appointmentEntities.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-600 text-center py-8">
              No appointments found. 
              {role === UserRole.CLIENT && (
                <a href="/appointments/book" className="text-primary-600 ml-1 hover:underline">
                  Book an appointment
                </a>
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointmentEntities.map((appointment) => (
              <div 
                key={appointment.getId()} 
                className="bg-white shadow rounded-lg p-6"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {appointment.getService()?.getName() || 'Unknown Service'}
                    </h3>
                    <p className="text-gray-600">
                      {appointment.formatDateTime()}
                    </p>
                    
                    {role === UserRole.CLIENT && appointment.getProfessional() && (
                      <p className="mt-2">
                        <span className="text-gray-600">Professional:</span>{' '}
                        <span className="font-medium">{appointment.getProfessional()?.getName()}</span>
                        {appointment.getProfessional()?.getSpecialty() && (
                          <span className="text-gray-600 ml-1">
                            ({appointment.getProfessional()?.getSpecialty()})
                          </span>
                        )}
                      </p>
                    )}
                    
                    {(role === UserRole.PROFESSIONAL || role === UserRole.ADMIN) && appointment.getClient() && (
                      <p className="mt-2">
                        <span className="text-gray-600">Client:</span>{' '}
                        <span className="font-medium">{appointment.getClient()?.getName()}</span>
                        {appointment.getClient()?.getPhone() && (
                          <span className="text-gray-600 ml-1">
                            ({appointment.getClient()?.getPhone()})
                          </span>
                        )}
                      </p>
                    )}
                    
                    {appointment.getService() && (
                      <p className="mt-2">
                        <span className="text-gray-600">Service:</span>{' '}
                        <span className="font-medium">{appointment.getService()?.getName()}</span>
                        <span className="text-gray-600 ml-1">
                          ({appointment.getService()?.formatDuration()}, 
                          {appointment.getService()?.formatPrice()})
                        </span>
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize
                      ${appointment.getStatus() === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${appointment.getStatus() === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                      ${appointment.getStatus() === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                      ${appointment.getStatus() === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                    `}>
                      {appointment.getStatus()}
                    </span>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      {/* Show different actions based on role and appointment status */}
                      {appointment.getStatus() === 'pending' && (
                        <>
                          <a 
                            href={`/appointments/${appointment.getId()}/reschedule`}
                            className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
                          >
                            Reschedule
                          </a>
                          
                          {role === UserRole.PROFESSIONAL && (
                            <form action={`/api/appointments/${appointment.getId()}/confirm`} method="POST">
                              <button 
                                type="submit"
                                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                              >
                                Confirm
                              </button>
                            </form>
                          )}
                          
                          <form action={`/api/appointments/${appointment.getId()}/cancel`} method="POST">
                            <button 
                              type="submit"
                              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                            >
                              Cancel
                            </button>
                          </form>
                        </>
                      )}
                      
                      {appointment.getStatus() === 'confirmed' && (
                        <>
                          {appointment.canReschedule() && (
                            <a 
                              href={`/appointments/${appointment.getId()}/reschedule`}
                              className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
                            >
                              Reschedule
                            </a>
                          )}
                          
                          {role === UserRole.PROFESSIONAL && (
                            <form action={`/api/appointments/${appointment.getId()}/complete`} method="POST">
                              <button 
                                type="submit"
                                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                              >
                                Mark Completed
                              </button>
                            </form>
                          )}
                          
                          <form action={`/api/appointments/${appointment.getId()}/cancel`} method="POST">
                            <button 
                              type="submit"
                              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                            >
                              Cancel
                            </button>
                          </form>
                        </>
                      )}
                      
                      <a 
                        href={`/appointments/${appointment.getId()}`}
                        className="px-3 py-1 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm"
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
