import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { Button } from '@/components/ui/button';
import { useCallback } from 'react';

export default function Login() {
  const { instance } = useMsal();
  const authenticated = useIsAuthenticated();

  const handleLogin = useCallback(() => {
    if (authenticated) {
      instance.logoutPopup();
      return;
    }
    instance.loginPopup();
  }, [instance]);

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
