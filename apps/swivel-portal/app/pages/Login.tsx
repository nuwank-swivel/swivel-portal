import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { Button, Paper, Title, Center, Loader } from '@mantine/core';
import CoreLayout from '../components/CoreLayout';
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
    <CoreLayout>
      <Center style={{ minHeight: '60vh' }}>
        <Paper
          p="xl"
          radius="md"
          withBorder
          style={{ minWidth: 340, textAlign: 'center' }}
        >
          <Title order={2} mb="md">
            Sign In
          </Title>
          <Button
            fullWidth
            size="lg"
            disabled={isLoading}
            onClick={handleLogin}
          >
            {isLoading ? <Loader size="sm" mr={8} /> : null}
            {isLoading ? 'Signing in...' : 'Sign in with Swivel account'}
          </Button>
        </Paper>
      </Center>
    </CoreLayout>
  );
}
