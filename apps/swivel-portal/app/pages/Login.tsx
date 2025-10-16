import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { Button, Paper, Title, Center, Loader } from '@mantine/core';
import { useCallback, useState } from 'react';
import { useUser } from '../lib/UserContext';
import { setIdToken } from '../lib/axios';
import { useNavigate } from 'react-router';
import { useRuntimeContext } from '@/lib/UseRuntimeContext';
import * as teams from '@microsoft/teams-js';

export default function Login() {
  const { instance } = useMsal();
  const authenticated = useIsAuthenticated();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const { setUser, initializeUserInfo } = useUser();
  const { runtime: context } = useRuntimeContext();

  const retrieveToken = async () => {
    console.log('Login context:', context);

    if (context === 'teams') {
      // Handle Teams login
      const response = await teams.authentication.getAuthToken();
      console.log('Teams authentication response:', response);
      return response;
    } else {
      // Handle browser login
      const loginResponse = await instance.loginPopup();
      const idToken = loginResponse.idToken;
      return idToken;
    }
  };

  const handleLogin = useCallback(async () => {
    setIsLoading(true);
    if (authenticated) {
      navigate('/');
    } else {
      try {
        const idToken = await retrieveToken();
        setIdToken(idToken);
        initializeUserInfo();
        navigate('/');
      } catch (err) {
        console.error('Login error:', err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [authenticated, instance, navigate, setUser]);

  return (
    <Center style={{ minHeight: '60vh' }}>
      <Paper
        p="xl"
        radius="md"
        withBorder
        style={{ minWidth: 340, textAlign: 'center' }}
      >
        <Title order={2} mb="md">
          Swivel Portal (running in {context})
        </Title>
        <Button fullWidth size="lg" disabled={isLoading} onClick={handleLogin}>
          {isLoading ? <Loader size="sm" mr={8} /> : null}
          {isLoading ? 'Signing in...' : 'Sign in with Swivel account'}
        </Button>
      </Paper>
    </Center>
  );
}
