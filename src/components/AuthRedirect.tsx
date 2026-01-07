import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

interface AuthRedirectProps {
  children: React.ReactNode;
}

// Redirect authenticated users away from login/signup pages
const AuthRedirect: React.FC<AuthRedirectProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);

  useEffect(() => {
    console.log('🔍 AuthRedirect - User:', currentUser?.email || 'null', 'Loading:', loading);

    // Check if we're processing OAuth callback (hash in URL)
    const hasOAuthHash = window.location.hash.includes('access_token') ||
                         window.location.hash.includes('error');

    if (hasOAuthHash && !currentUser && !loading) {
      console.log('🔄 OAuth hash detected, waiting for authentication...');
      setIsProcessingOAuth(true);

      // Give Supabase max 5 seconds to process the OAuth callback
      const timeout = setTimeout(() => {
        console.log('⏱️ OAuth processing timeout, showing login page');
        setIsProcessingOAuth(false);
      }, 5000);

      return () => clearTimeout(timeout);
    } else if (currentUser && isProcessingOAuth) {
      setIsProcessingOAuth(false);
    }
  }, [currentUser, loading, isProcessingOAuth]);

  // Wait for auth to initialize or OAuth to process
  if (loading || isProcessingOAuth) {
    console.log('⏳ AuthRedirect - Loading...', { loading, isProcessingOAuth });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Signing you in...</p>
        </div>
      </div>
    );
  }

  if (currentUser) {
    // User is already authenticated, redirect to dashboard
    console.log('✅ AuthRedirect - User authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('❌ AuthRedirect - No user, showing login page');
  return <>{children}</>;
};

export default AuthRedirect;

