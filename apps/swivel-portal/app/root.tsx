import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type MetaFunction,
  type LinksFunction,
} from 'react-router';
import { Toaster as Sonner } from '@/components/ui/sonner';

import { Toaster } from '@/components/ui/toaster';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from './components/ui/tooltip';
import './index.css';
import { Configuration, PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';

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
  const queryClient = new QueryClient();

  const msalConfig: Configuration = {
    auth: {
      clientId: import.meta.env.VITE_AZURE_AD_CLIENT_ID ?? '', // TODO: Replace with actual client ID
      authority: `https://login.microsoftonline.com/${
        import.meta.env.VITE_AZURE_TENANT_ID
      }`,
      redirectUri: 'http://localhost:4200/redirect',
    },
  };
  const msalInstance = new PublicClientApplication(msalConfig);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <MsalProvider instance={msalInstance}>
              <Toaster />
              <Sonner />
              {children}
              <ScrollRestoration />
              <Scripts />
            </MsalProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
