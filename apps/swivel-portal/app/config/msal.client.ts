import { Configuration, PublicClientApplication } from '@azure/msal-browser';

export const MSAL_CONFIG: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_AD_CLIENT_ID ?? '', // TODO: Replace with actual client ID
    authority: `https://login.microsoftonline.com/${
      import.meta.env.VITE_AZURE_TENANT_ID
    }`,
    redirectUri: `${window.location.origin}/auth`,
  },
  cache: {
    cacheLocation: 'localStorage', // Persist tokens across sessions
    storeAuthStateInCookie: false,
  },
};

export const getMSALInstance = () => {
  return new PublicClientApplication(MSAL_CONFIG);
};
