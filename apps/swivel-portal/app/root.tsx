import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type MetaFunction,
  type LinksFunction,
} from 'react-router';
import { Toaster } from '@/components/ui/toaster';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import { MsalProvider } from '@azure/msal-react';
import { useEffect, useMemo, useState } from 'react';
import { UserProvider } from './lib/UserContext';
import { theme } from './theme';
import { MantineProvider, mantineHtmlProps } from '@mantine/core';
import { getMSALInstance } from './config/msal.client';
import { RuntimeProvider } from './lib/UseRuntimeContext';

export const meta: MetaFunction = () => [
  {
    title: 'New Nx React Router App',
  },
];

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const queryClient = new QueryClient();

  const msalInstance = useMemo(() => getMSALInstance && getMSALInstance(), []);

  useEffect(() => {
    const initializeMsal = async () => {
      try {
        console.log('Initializing MSAL...');
        await msalInstance.initialize();
        console.log('MSAL initialized successfully');
        setInitialized(true);
      } catch (error) {
        console.error('MSAL initialization error:', error);
      }
    };
    if (!initialized && msalInstance) {
      initializeMsal();
    }
  }, [initialized, msalInstance]);

  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <MantineProvider theme={theme}>
            {msalInstance && (
              <MsalProvider instance={msalInstance}>
                <RuntimeProvider>
                  <UserProvider>
                    <Toaster />
                    {initialized ? children : null}
                  </UserProvider>
                </RuntimeProvider>
              </MsalProvider>
            )}
          </MantineProvider>
          <ScrollRestoration />
          <Scripts />
        </QueryClientProvider>
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
