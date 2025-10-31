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
import { useTheme } from './ThemeContext';

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

  const initializeUserInfo = useCallback(async () => {
    Logger.debug('[auth] Fetching user profile');
    const userResponse = await getUserInfo();
    if (userResponse === null) {
      setError('Failed to fetch user info');
      Logger.error('[auth] Failed to fetch user info', {
        reason: 'User endpoint returned null',
      });

      return;
    }

    setUser(userResponse);
    Logger.info(`[auth][${userResponse.name}] User profile initialized`, {
      userId: userResponse.azureAdId,
      isAdmin: userResponse.isAdmin,
    });
  }, []);

  const refreshAuth = async () => {
    try {
      Logger.debug('[auth] Refreshing Teams auth token', {
        userId: user?.azureAdId,
      });
      const idToken = await teams.authentication.getAuthToken();
      setIdToken(idToken);
      Logger.info('[auth] Auth token refreshed', {
        hasToken: Boolean(idToken),
        userId: user?.azureAdId,
      });
    } catch (error) {
      Logger.error('[auth] Failed to refresh auth token', {
        userId: user?.azureAdId,
        error,
      });
      throw error;
    }
  };

  const registerForCaching = useCallback(() => {
    teams.app.lifecycle.registerOnResumeHandler((data) => {
      Logger.debug('[lifecycle] App resumed', {
        resumeContext: data,
      });
      teams.app.notifySuccess();
    });

    teams.app.lifecycle.registerBeforeSuspendOrTerminateHandler(() => {
      Logger.debug('[lifecycle] App preparing to suspend or terminate');
      return Promise.resolve();
    });
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        Logger.debug('[init] Initializing Teams SDK');
        await teams.app.initialize();
        Logger.info('[init] Teams SDK initialized');

        registerForCaching();

        const appContext = await teams.app.getContext();
        setColorScheme(appContext.app.theme === 'dark' ? 'dark' : 'light');
        Logger.info('[theme] Applied Teams theme preference', {
          theme: appContext.app.theme,
        });

        const idToken = await teams.authentication.getAuthToken();
        setIdToken(idToken);
        Logger.debug('[auth] Initial auth token acquired', {
          hasToken: Boolean(idToken),
        });

        const teamsUser = (await teams.app.getContext()).user;
        Logger.info(
          `[auth][${teamsUser?.userPrincipalName}] User authenticated with Teams`,
          {
            teamsUserId: teamsUser?.id,
          }
        );

        await initializeUserInfo();
      } catch (error) {
        Logger.error('[init] Teams SDK initialization failed', { error });

        if (error instanceof Error) {
          setError(JSON.stringify(error.message));
        } else {
          setError('Teams initialization failed');
        }
      }
    };

    initialize();
  }, [initializeUserInfo, registerForCaching, setColorScheme]);

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
