import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LogoutButton from '@/components/auth/LogoutButton';

export default async function ProfilePage() {
  // Create Supabase client
  const supabase = createClient();
  
  // Check if user is logged in
  const { data: { session } } = await supabase.auth.getSession();
  
  // If user is not logged in, redirect to login
  if (!session) {
    redirect('/login?redirect=/profile');
  }
  
  // Get user profile from database
  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', session.user.email)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
  }
  
  // Get user role from profile or session metadata
  const role = profile?.role || session.user.user_metadata?.role || 'client';
  
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Profile</h1>
          <div className="flex space-x-4">
            <a 
              href="/dashboard" 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Dashboard
            </a>
            <LogoutButton />
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Your Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <div className="p-3 bg-gray-100 rounded-md">
                {profile?.name || session.user.user_metadata?.name || 'Not set'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="p-3 bg-gray-100 rounded-md">
                {session.user.email}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <div className="p-3 bg-gray-100 rounded-md capitalize">
                {role}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
              <div className="p-3 bg-gray-100 rounded-md">
                {profile?.created_at 
                  ? new Date(profile.created_at).toLocaleDateString() 
                  : new Date(session.user.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <a 
              href="/profile/edit" 
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Edit Profile
            </a>
          </div>
        </div>
        
        {/* Role-specific information */}
        {role === 'professional' && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">Professional Information</h2>
            <p className="text-gray-600 mb-4">
              Manage your professional details and services.
            </p>
            <div className="flex space-x-4">
              <a 
                href="/profile/professional" 
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Manage Professional Details
              </a>
              <a 
                href="/services" 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Manage Services
              </a>
            </div>
          </div>
        )}
        
        {role === 'client' && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">Client Information</h2>
            <p className="text-gray-600 mb-4">
              Manage your client details and view your appointment history.
            </p>
            <div className="flex space-x-4">
              <a 
                href="/profile/client" 
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Manage Client Details
              </a>
              <a 
                href="/appointments" 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                View Appointments
              </a>
            </div>
          </div>
        )}
        
        {role === 'admin' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Admin Controls</h2>
            <p className="text-gray-600 mb-4">
              Access administrative functions and system settings.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a 
                href="/admin/users" 
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 text-center"
              >
                Manage Users
              </a>
              <a 
                href="/admin/professionals" 
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 text-center"
              >
                Manage Professionals
              </a>
              <a 
                href="/admin/services" 
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 text-center"
              >
                Manage Services
              </a>
              <a 
                href="/admin/settings" 
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 text-center"
              >
                System Settings
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
