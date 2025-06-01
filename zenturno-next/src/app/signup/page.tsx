import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SignupForm from '@/components/auth/SignupForm'

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
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
            <a href="/login" className="text-primary-600 hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
