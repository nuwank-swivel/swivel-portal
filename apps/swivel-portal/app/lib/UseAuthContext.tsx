import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import * as teams from '@microsoft/teams-js';
import { setIdToken } from './axios';
import { getUserInfo } from './api/auth';
import { Loading } from '@/pages/Loading';

export interface User {
  azureAdId: string;
  name?: string;
  email: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const initializeUserInfo = async () => {
    const user = await getUserInfo();
    setUser(user);
    console.log('User info initialized');
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        await teams.app.initialize();
        console.log('Teams SDK initialized');

        const idToken = await teams.authentication.getAuthToken();
        setIdToken(idToken);

        await initializeUserInfo();
      } catch (error) {
        console.error('Teams SDK initialization failed:', error);
      }
    };

    initialize();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {user !== null ? children : <Loading />}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error('useAuthContext must be used within an AuthProvider');
  return ctx;
}
