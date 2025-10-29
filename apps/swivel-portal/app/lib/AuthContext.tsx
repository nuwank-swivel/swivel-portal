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
import { Logger } from './logger';

export interface User {
  azureAdId: string;
  name?: string;
  email: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);

  const initializeUserInfo = async () => {
    const user = await getUserInfo();
    if (user === null) {
      setError('Failed to fetch user info');
      Logger.error('[auth] Failed to fetch user info');

      return;
    }
    setUser(user);
    Logger.info('[auth] User info initialized', { user });
  };

  const refreshAuth = async () => {
    const idToken = await teams.authentication.getAuthToken();
    setIdToken(idToken);
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        await teams.app.initialize();
        console.log('Teams SDK initialized');
        Logger.info('[init] Teams SDK initialized');

        const idToken = await teams.authentication.getAuthToken();
        setIdToken(idToken);

        const teamsUser = (await teams.app.getContext()).user;
        Logger.info('[auth] User authenticated with Teams', { teamsUser });

        await initializeUserInfo();
      } catch (error) {
        console.error('[init] Teams SDK initialization failed:', error);

        if (error instanceof Error) {
          Logger.error('[init] Teams SDK initialization failed:', { error });
          setError(JSON.stringify(error.message));
        }
      }
    };

    initialize();
  }, []);

  return (
    <AuthContext.Provider value={{ user, refreshAuth }}>
      {user !== null ? children : <Loading error={error} />}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error('useAuthContext must be used within an AuthProvider');
  return ctx;
}
