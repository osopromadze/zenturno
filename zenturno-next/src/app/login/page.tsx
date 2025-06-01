import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginForm from '@/components/auth/LoginForm'

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
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
            <a href="/signup" className="text-primary-600 hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
