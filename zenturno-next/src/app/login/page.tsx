import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MagicLoginForm from '@/components/auth/MagicLoginForm'
import MagicAuthLayout from '@/components/auth/MagicAuthLayout'

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
    <MagicAuthLayout 
      title="Sign In to ZenTurno"
      subtitle={justRegistered 
        ? "Account created successfully! Please sign in with your credentials." 
        : "Enter your credentials to access your account"
      }
      showLogo={true}
    >
      <MagicLoginForm redirectTo={redirectPath} />
    </MagicAuthLayout>
  )
}
