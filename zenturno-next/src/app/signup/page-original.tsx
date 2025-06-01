import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SignupForm from '@/components/auth/SignupForm'
import Link from 'next/link'

export default async function SignupPage() {
  // Create Supabase client
  const supabase = createClient()
  
  // Check if user is already logged in
  const { data: { session } } = await supabase.auth.getSession()
  
  // If user is logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard')
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">ZenTurno</Link>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/login"
                className="px-4 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="mt-2 text-gray-600">
            Join ZenTurno to book and manage appointments
          </p>
        </div>
        
        <SignupForm />
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
  )
}
