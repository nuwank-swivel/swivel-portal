import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import Login from '../app/pages/Login';

const msalConfig = {
  auth: {
    clientId: 'test-client-id',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: 'http://localhost/login',
  },
};
const msalInstance = new PublicClientApplication(msalConfig);

describe('Login Page', () => {
  it('renders the Sign in with Microsoft button', () => {
    render(
      <MsalProvider instance={msalInstance}>
        <Login />
      </MsalProvider>
    );
    expect(screen.getByText('Sign in with Microsoft')).toBeInTheDocument();
  });
});
