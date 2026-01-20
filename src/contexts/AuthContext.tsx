import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  currentUser: User | null;
  session: Session | null;
  loading: boolean;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<User | null>;
  refreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const signup = async (email: string, password: string, displayName?: string) => {
    try {
      console.log('📝 Signing up user:', email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0]
          }
        }
      });

      if (error) throw error;

      console.log('✅ Signup successful:', data.user?.email);

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      console.error('❌ Signup error:', error);

      let errorMessage = "Failed to create account. Please try again.";

      switch (error.message) {
        case 'User already registered':
          errorMessage = "An account with this email already exists.";
          break;
        case 'Password should be at least 6 characters':
          errorMessage = "Password must be at least 6 characters long.";
          break;
        default:
          errorMessage = error.message || "Failed to create account. Please try again.";
      }

      toast({
        title: "Signup failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Logging in user:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('✅ Login successful:', data.user?.email);

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    } catch (error: any) {
      console.error('❌ Login error:', error);

      let errorMessage = "Invalid credentials. Please check your email and password.";

      switch (error.message) {
        case 'Invalid login credentials':
          errorMessage = "Invalid credentials. Please check your email and password.";
          break;
        case 'Email not confirmed':
          errorMessage = "Please verify your email address before logging in.";
          break;
        default:
          errorMessage = "Invalid credentials. Please check your email and password.";
      }

      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      console.log('🚀 Starting Google sign-in...');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });

      if (error) throw error;

      console.log('✅ Google sign-in initiated, redirecting to Google...');

      // The actual user will be available after redirect
      return null;
    } catch (error: any) {
      console.error('❌ Google login error:', error);

      let errorMessage = "Unable to sign in with Google. Please try again.";

      switch (error.message) {
        case 'Provider not enabled':
          errorMessage = "Google sign-in is not enabled. Please contact support.";
          break;
        default:
          errorMessage = `Unable to sign in with Google. ${error.message}`;
      }

      toast({
        title: "Google login failed",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    }
  };

  const logout = async () => {
    try {
      // Disable all automations for this user before logging out
      if (currentUser?.email) {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        try {
          await fetch(`${backendUrl}/api/automation/disable-all-for-user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentUser.email, userId: currentUser.id })
          });
        } catch (automationError) {
          // Continue with logout even if automation disable fails
        }
      }

      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const refreshToken = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) throw error;

      return data.session?.access_token || null;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('🔍 AuthContext - Setting up auth state listener...');

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCurrentUser(session?.user ?? null);
      setLoading(false);
      console.log('✅ AuthContext - Initial session loaded:', session?.user?.email || 'No user');
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔍 AuthContext - Auth state changed:', event, session?.user?.email || 'No user');

      setSession(session);
      setCurrentUser(session?.user ?? null);
      setLoading(false);

      // Show appropriate toasts for auth events
      if (event === 'SIGNED_IN') {
        toast({
          title: "Welcome!",
          description: "You have successfully signed in.",
        });
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed');
      } else if (event === 'USER_UPDATED') {
        console.log('User updated');
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    session,
    loading,
    signup,
    login,
    logout,
    loginWithGoogle,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
