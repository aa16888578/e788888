import { useState, useEffect, createContext, useContext } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (telegramId: number) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // 這裡應該根據 Firebase 用戶獲取我們的用戶數據
        // 暫時使用模擬數據
        const mockUser: User = {
          id: firebaseUser.uid,
          telegramId: 123456789,
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          status: 'active',
          permissions: ['all'],
          lastLogin: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setUser(mockUser);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (telegramId: number) => {
    // 這裡應該實現 Telegram 認證邏輯
    console.log('Signing in with Telegram ID:', telegramId);
  };

  const signOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return {
    user,
    firebaseUser,
    loading,
    signIn,
    signOut,
  };
}
