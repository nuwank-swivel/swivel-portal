import { useIsAuthenticated } from '@azure/msal-react';
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { getUserInfo } from './api/auth';
import { Loading } from '@/pages/Loading';

export interface User {
  azureAdId: string;
  name?: string;
  email: string;
  isAdmin?: boolean;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  initializeUserInfo: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const authenticated = useIsAuthenticated();

  const initializeUserInfo = async () => {
    const user = await getUserInfo();
    setUser(user);
    console.log('User info initialized');
  };

  useEffect(() => {
    if (authenticated && user === null) {
      // fetch user details from backend
      initializeUserInfo();
    }
  }, [authenticated, user]);

  return (
    <UserContext.Provider value={{ user, setUser, initializeUserInfo }}>
      {authenticated && user === null ? <Loading /> : children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}
