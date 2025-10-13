import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { Button } from '@/components/ui/button';
import { useCallback } from 'react';
import api, { setIdToken } from '../lib/axios';
import { useNavigate } from 'react-router';
export default function Login() {
  const { instance } = useMsal();
  const authenticated = useIsAuthenticated();
  const navigate = useNavigate();
  const handleLogin = useCallback(async () => {
    if (authenticated) {
      instance.logoutPopup();
      return;
    }
    try {
      const loginResponse = await instance.loginPopup();
      const idToken = loginResponse.idToken;
      setIdToken(idToken);
      await api.post('/auth/login');
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
    }
  }, [instance, authenticated]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-3xl font-bold">Sign In</h1>
        <Button onClick={handleLogin} className="w-64 h-12 text-lg">
          {authenticated ? 'Sign out' : 'Sign in with Microsoft'}
        </Button>
      </div>
    </div>
  );
}
