"use client";

import { AuthProvider } from '@/context/AuthContext';
import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function AppointmentsPage() {
  // Redirect to the dashboard appointments page
  useEffect(() => {
    redirect('/dashboard/appointments');
  }, []);
  
  // This will only be shown momentarily before the redirect
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );
}
