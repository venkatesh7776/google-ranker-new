import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const signup = async (email: string, password: string, displayName?: string) => {
    try {
      // Ensure persistence is set before signup
      await setPersistence(auth, browserLocalPersistence);

      const result = await createUserWithEmailAndPassword(auth, email, password);

      if (displayName && result.user) {
        await updateProfile(result.user, {
          displayName: displayName
        });
      }

      toast({
        title: "Account created successfully!",
        description: "Welcome to LOBAISEO!",
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Signup failed",
        description: error.message || "An error occurred during signup",
        variant: "destructive",
      });
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = "An error occurred during login";

      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No account found with this email address";
          break;
        case 'auth/wrong-password':
          errorMessage = "Incorrect password";
          break;
        case 'auth/invalid-email':
          errorMessage = "Invalid email address";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many failed attempts. Please try again later";
          break;
        default:
          errorMessage = error.message;
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
      console.log('🚀 Starting Google sign-in with POPUP...');

      // Ensure persistence is set before Google login
      await setPersistence(auth, browserLocalPersistence);
      console.log('✅ Persistence set to browserLocalPersistence');

      // CRITICAL: Remove ALL Google Identity Services scripts that might interfere with Firebase Auth
      console.log('🧹 Cleaning up Google Identity Services scripts...');

      // Remove all Google-related scripts
      document.querySelectorAll('script[src*="accounts.google.com"]').forEach(s => {
        console.log('🗑️ Removing script:', s.getAttribute('src'));
        s.remove();
      });
      document.querySelectorAll('script[src*="apis.google.com"]').forEach(s => {
        console.log('🗑️ Removing script:', s.getAttribute('src'));
        s.remove();
      });
      document.querySelectorAll('script[src*="gapi"]').forEach(s => {
        console.log('🗑️ Removing script:', s.getAttribute('src'));
        s.remove();
      });
      document.querySelectorAll('script[src*="gsi"]').forEach(s => {
        console.log('🗑️ Removing script:', s.getAttribute('src'));
        s.remove();
      });

      // Clear any cached Google objects from window
      if (window.google) {
        console.log('🗑️ Clearing window.google object');
        delete (window as any).google;
      }
      if ((window as any).gapi) {
        console.log('🗑️ Clearing window.gapi object');
        delete (window as any).gapi;
      }

      // Wait a bit for cleanup to take effect
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create a clean Google provider instance
      const provider = new GoogleAuthProvider();

      // IMPORTANT: Do NOT set custom parameters that might include continue_url
      // Only set the prompt parameter
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      // Add required scopes
      provider.addScope('email');
      provider.addScope('profile');

      console.log('🚀 Calling signInWithPopup...');
      const result = await signInWithPopup(auth, provider);
      console.log('✅ Google sign-in successful!', result.user.email);

      toast({
        title: "Welcome!",
        description: "You have successfully signed in with Google.",
      });
    } catch (error: any) {
      console.error('❌ Google login error:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      console.error('❌ Full error object:', error);

      // Don't show error if user closed the popup
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        console.log('User closed Google sign-in popup');
        throw error;
      }

      // Show error toast for actual errors
      let errorMessage = "An error occurred during Google login";
      let helpText = "";

      switch (error.code) {
        case 'auth/popup-blocked':
          errorMessage = "Popup was blocked by your browser. Please allow popups for this site.";
          break;
        case 'auth/unauthorized-domain':
          errorMessage = "Domain not authorized for Google sign-in.";
          helpText = "Firebase Console → Authentication → Settings → Authorized domains → Add 'localhost'";
          break;
        case 'auth/invalid-continue-uri':
          errorMessage = "Firebase configuration error.";
          helpText = "REQUIRED: Add 'localhost' (without port) to Firebase Console → Authentication → Settings → Authorized domains. Wait 2-3 minutes after adding, then refresh this page.";
          console.error('❌ SETUP REQUIRED: Go to Firebase Console and add "localhost" to authorized domains!');
          console.error('📍 URL: https://console.firebase.google.com/project/gmb-automation-474209-549ee/authentication/settings');
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = "An account already exists with this email using a different sign-in method.";
          break;
        default:
          errorMessage = error.message;
      }

      toast({
        title: "Google login failed",
        description: helpText || errorMessage,
        variant: "destructive",
        duration: 10000, // Show longer for setup instructions
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout",
        variant: "destructive",
      });
      throw error;
    }
  };

  const refreshToken = async (): Promise<string | null> => {
    try {
      if (currentUser) {
        const token = await currentUser.getIdToken(true);
        console.log('Firebase token refreshed successfully');
        return token;
      }
      return null;
    } catch (error) {
      console.error('Failed to refresh Firebase token:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('🔍 AuthContext - Setting up auth state listener...');

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔍 AuthContext - Auth state changed:', user ? 'User: ' + user.email : 'No user');

      if (user) {
        try {
          // Force token refresh to ensure it's valid
          await user.getIdToken(true);
          console.log('✅ AuthContext - User authenticated and token refreshed:', user.email);
        } catch (error) {
          console.error('❌ AuthContext - Token refresh failed during auth state change:', error);
        }
      }
      setCurrentUser(user);
      setLoading(false);
      console.log('✅ AuthContext - Loading set to false, currentUser:', user ? user.email : 'null');
    });

    // Set up automatic token refresh every 30 minutes
    const tokenRefreshInterval = setInterval(async () => {
      if (currentUser) {
        try {
          await currentUser.getIdToken(true);
          console.log('Auth token automatically refreshed');
        } catch (error) {
          console.error('Automatic token refresh failed:', error);
        }
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => {
      unsubscribe();
      clearInterval(tokenRefreshInterval);
    };
  }, [currentUser]);

  const value: AuthContextType = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    loginWithGoogle,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

