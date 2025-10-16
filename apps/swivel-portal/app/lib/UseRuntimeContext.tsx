import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import * as teams from '@microsoft/teams-js';

export interface User {
  azureAdId: string;
  name?: string;
  email: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  runtime: 'teams' | 'browser';
}

const RuntimeContext = createContext<AuthContextType | undefined>(undefined);

export function RuntimeProvider({ children }: { children: ReactNode }) {
  const [runtime, setRuntime] = useState<'teams' | 'browser'>('browser');

  useEffect(() => {
    teams.app
      .initialize()
      .then(() => {
        console.log('Teams SDK initialized');
        setRuntime('teams');
      })
      .catch((error) => {
        console.error('Teams SDK initialization failed:', error);
        setRuntime('browser');
      });
  }, []);

  return (
    <RuntimeContext.Provider value={{ runtime: runtime }}>
      {children}
    </RuntimeContext.Provider>
  );
}

export function useRuntimeContext() {
  const ctx = useContext(RuntimeContext);
  if (!ctx)
    throw new Error('useRuntimeContext must be used within a RuntimeProvider');
  return ctx;
}
