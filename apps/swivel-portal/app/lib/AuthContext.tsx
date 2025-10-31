import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import * as teams from '@microsoft/teams-js';
import { setIdToken } from './axios';
import { getUserInfo } from './api/auth';
import { Loading } from '@/pages/Loading';
import { Logger } from './logger';
import { ThemeColorScheme, useTheme } from './ThemeContext';

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
  const { setColorScheme } = useTheme();

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

  const registerForCaching = useCallback(() => {
    teams.app.lifecycle.registerOnResumeHandler((data) => {
      teams.app.notifySuccess();
    });

    teams.app.lifecycle.registerBeforeSuspendOrTerminateHandler(() => {
      return Promise.resolve();
    });
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        await teams.app.initialize();
        console.log('Teams SDK initialized');
        Logger.info('[init] Teams SDK initialized');

        registerForCaching();

        const appContext = await teams.app.getContext();
        console.log('App theme retrieved:', appContext.app.theme);
        setColorScheme(appContext.app.theme === 'dark' ? 'dark' : 'light');

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
