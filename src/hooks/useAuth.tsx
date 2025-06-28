
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInAnonymously, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  userRole: 'guest' | 'normal' | 'creator';
  loading: boolean;
  signInAsGuest: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  canInteract: boolean; // Can like, comment, review
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'guest' | 'normal' | 'creator'>('guest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for initial auth token
    const initialToken = (window as any).__initial_auth_token;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', { user: user?.uid, isAnonymous: user?.isAnonymous });
      setUser(user);
      
      if (user) {
        // Determine user role based on authentication method
        if (user.isAnonymous) {
          setUserRole('guest');
        } else {
          // For now, all non-anonymous users are 'normal' users
          // In the future, we can implement creator role detection
          setUserRole('normal');
        }
      } else {
        setUserRole('guest');
      }
      
      setLoading(false);
    });

    // Auto sign in anonymously if no user and no initial token
    if (!initialToken) {
      signInAnonymously(auth).catch(console.error);
    } else {
      // Handle initial auth token if provided
      signInWithCustomToken(auth, initialToken).catch(console.error);
    }

    return unsubscribe;
  }, []);

  const signInAsGuest = async () => {
    try {
      await signInAnonymously(auth);
      toast.success('Signed in as guest');
    } catch (error) {
      console.error('Guest sign in failed:', error);
      toast.error('Failed to sign in as guest');
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Signed in successfully');
    } catch (error: any) {
      console.error('Email sign in failed:', error);
      toast.error(error.message || 'Failed to sign in');
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success('Account created successfully');
    } catch (error: any) {
      console.error('Email sign up failed:', error);
      toast.error(error.message || 'Failed to create account');
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // Auto sign in anonymously after sign out
      await signInAnonymously(auth);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out failed:', error);
      toast.error('Failed to sign out');
    }
  };

  const isAuthenticated = !!user;
  const canInteract = userRole !== 'guest'; // Only normal users and creators can interact

  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      loading,
      signInAsGuest,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      isAuthenticated,
      canInteract
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
