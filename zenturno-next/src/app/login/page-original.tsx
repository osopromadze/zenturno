import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginForm from '@/components/auth/LoginForm'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string; registered?: string }
}) {
  // Create Supabase client
  const supabase = createClient()
  
  // Check if user is already logged in
  const { data: { session } } = await supabase.auth.getSession()
  
  // If user is logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard')
  }
  
  // Get redirect path from query parameter
  const redirectPath = searchParams.redirect || '/dashboard'
  
  // Check if user just registered
  const justRegistered = searchParams.registered === 'true'
  
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
                href="/signup"
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
          <h1 className="text-3xl font-bold">Sign In to ZenTurno</h1>
          <p className="mt-2 text-gray-600">
            Enter your credentials to access your account
          </p>
        </div>
        
        {justRegistered && (
          <div className="p-3 bg-green-100 border border-green-300 rounded-md text-green-800 text-sm">
            Account created successfully! Please sign in with your credentials.
          </div>
        )}
        
        <LoginForm redirectTo={redirectPath} />
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <a href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
  )
}
