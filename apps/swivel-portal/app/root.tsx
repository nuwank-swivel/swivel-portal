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
import { Configuration, PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { useEffect, useMemo, useState } from 'react';
import { UserProvider } from './lib/UserContext';
import { theme } from './theme';
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from '@mantine/core';

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

const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_AD_CLIENT_ID ?? '', // TODO: Replace with actual client ID
    authority: `https://login.microsoftonline.com/${
      import.meta.env.VITE_AZURE_TENANT_ID
    }`,
    redirectUri: 'http://localhost:4200/auth',
  },
  cache: {
    cacheLocation: 'localStorage', // Persist tokens across sessions
    storeAuthStateInCookie: false,
  },
};

export function Layout({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const queryClient = new QueryClient();

  const msalInstance = useMemo(
    () => new PublicClientApplication(msalConfig),
    []
  );

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
    if (!initialized) {
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
            <MsalProvider instance={msalInstance}>
              <UserProvider>
                <Toaster />
                {initialized ? children : null}
              </UserProvider>
            </MsalProvider>
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
