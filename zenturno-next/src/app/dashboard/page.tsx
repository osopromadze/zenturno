"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
  const { session, userProfile, role, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Redirect to login if not authenticated
    if (!isLoading && !session) {
      router.push('/login');
    }
  }, [isLoading, session, router]);

  // Show loading state while authentication is being checked
  if (isLoading || !isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-primary rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state if profile couldn't be loaded
  if (!isLoading && session && !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error loading profile. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  // Don't render content until we have the session and profile
  if (!session || !userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        
        {/* Success message */}
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {decodeURIComponent(message)}
          </div>
        )}
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Welcome, {userProfile?.name || session.user.user_metadata?.name || 'User'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Email:</p>
              <p className="font-medium">{session.user.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Role:</p>
              <p className="font-medium capitalize">{role}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Common links for all users */}
          <DashboardCard
            title="My Profile"
            description="View and edit your profile information"
            link="/dashboard/profile"
          />
          
          {/* Client-specific links */}
          {(role === 'client' || role === 'admin') && (
            <>
              <DashboardCard
                title="Book Appointment"
                description="Schedule a new appointment with a professional"
                link="/dashboard/appointments/book"
              />
              <DashboardCard
                title="My Appointments"
                description="View and manage your upcoming appointments"
                link="/dashboard/appointments"
              />
            </>
          )}
          
          {/* Professional-specific links */}
          {(role === 'professional' || role === 'admin') && (
            <>
              <DashboardCard
                title="My Appointments"
                description="View and manage your appointment schedule"
                link="/dashboard/appointments"
              />
            </>
          )}
          
          {/* Admin-specific links */}
          {role === 'admin' && (
            <>
              <DashboardCard
                title="Manage Users"
                description="View and manage system users"
                link="/users"
              />
              <DashboardCard
                title="Manage Services"
                description="View and manage available services"
                link="/services"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, description, link }: { title: string; description: string; link: string }) {
  return (
    <Link
      href={link}
      className="block bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
    >
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </Link>
  );
}
