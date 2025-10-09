import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router';
import Dashboard from './pages/Dashboard';
import SeatBooking from './pages/SeatBooking';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';

const queryClient = new QueryClient();

const msalConfig = {
  auth: {
    clientId: 'YOUR_AZURE_AD_CLIENT_ID', // TODO: Replace with actual client ID
    authority: 'https://login.microsoftonline.com/common',
    redirectUri:
      typeof window !== 'undefined' ? window.location.origin + '/login' : '',
  },
};
const msalInstance = new PublicClientApplication(msalConfig);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <MsalProvider instance={msalInstance}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/seat-booking" element={<SeatBooking />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </MsalProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
