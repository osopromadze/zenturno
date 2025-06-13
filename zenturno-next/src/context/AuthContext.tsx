"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from '@/lib/supabase/client';
import { useRouter } from "next/navigation";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
};

type AuthContextType = {
  session: any | null;
  userProfile: UserProfile | null;
  role: string;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<string>('client');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchUserProfile = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsLoading(false);
        return;
      }
      
      setSession(session);
      
      // Get user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('email', session.user.email)
        .single();
      
      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // User doesn't exist - create user record
          const name = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User';
          const userRole = session.user.user_metadata?.role || 'client';
          
          const userInsertData = {
            email: session.user.email,
            name: name,
            role: userRole,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert(userInsertData)
            .select()
            .single();
          
          if (createError) {
            setError('Error creating user profile');
            // Fallback to session data
            const fallbackProfile = {
              id: session.user.id,
              name: name,
              email: session.user.email || '',
              role: userRole,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            setUserProfile(fallbackProfile);
            setRole(userRole);
          } else {
            setUserProfile(newUser);
            setRole(newUser.role);
          }
        } else {
          setError('Error fetching user profile');
          // Fallback to session data
          const fallbackRole = session.user.user_metadata?.role || 'client';
          const fallbackProfile = {
            id: session.user.id,
            name: session.user.user_metadata?.name || (session.user.email ? session.user.email.split('@')[0] : 'User'),
            email: session.user.email || '',
            role: fallbackRole,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setUserProfile(fallbackProfile);
          setRole(fallbackRole);
        }
      } else {
        // User profile found
        setUserProfile(profile);
        setRole(profile.role);
      }
    } catch (error) {
      setError('Unexpected error fetching user data');
      console.error('Error in fetchUserProfile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    setIsLoading(true);
    setError(null);
    await fetchUserProfile();
  };

  const signOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setSession(null);
      setUserProfile(null);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    
    // Set up auth state listener
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          fetchUserProfile();
        } else {
          setUserProfile(null);
          setRole('client');
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        userProfile,
        role,
        isLoading,
        error,
        refreshProfile,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
