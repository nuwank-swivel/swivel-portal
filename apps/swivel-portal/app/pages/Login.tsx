import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { Button } from '@/components/ui/button';
import { useCallback, useState } from 'react';
import { useUser, User } from '../lib/UserContext';
import api, { setIdToken } from '../lib/axios';
import { useNavigate } from 'react-router';
import { getUserInfo } from '@/lib/api/auth';
export default function Login() {
  const { instance } = useMsal();
  const authenticated = useIsAuthenticated();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const { setUser, initializeUserInfo } = useUser();

  const handleLogin = useCallback(async () => {
    setIsLoading(true);

    if (authenticated) {
      instance.logoutPopup();
      setIsLoading(false);
      return;
    }

    try {
      const loginResponse = await instance.loginPopup();
      const idToken = loginResponse.idToken;
      setIdToken(idToken);
      initializeUserInfo();
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [authenticated, instance, navigate, setUser]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-3xl font-bold">Sign In</h1>
        <Button
          disabled={isLoading}
          onClick={handleLogin}
          className="w-96 h-12 text-lg"
        >
          {isLoading ? 'Signing in...' : 'Sign in with Swivel account'}
        </Button>
      </div>
    </div>
  );
}
