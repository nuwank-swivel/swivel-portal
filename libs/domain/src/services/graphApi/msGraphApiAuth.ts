import * as msal from '@azure/msal-node';
import { HttpError } from '@swivel-portal/types';
import { StatusCodes } from 'http-status-codes';

const cachedTokens = new Map<string, string>();

/**
 * Exchanges the client token for a Microsoft Graph API token using OBO flow.
 * @param clientToken token acquired from MS Entra
 * @returns access token for Microsoft Graph API
 */
export const getMSGraphToken = async (
  clientToken: string
): Promise<string | null> => {
  if (cachedTokens.has(clientToken)) {
    console.log('Using cached MS Graph token');
    return cachedTokens.get(clientToken) as string;
  }

  const tid = process.env.MS_ENTRA_TENANT_ID;
  const token = clientToken;
  const scopes = ['https://graph.microsoft.com/User.ReadBasic.All'];

  // Creating MSAL client
  const msalClient = new msal.ConfidentialClientApplication({
    auth: {
      clientId: process.env.MS_ENTRA_CLIENT_ID ?? '',
      clientSecret: process.env.MS_ENTRA_CLIENT_SECRET,
    },
  });

  try {
    const result = await msalClient.acquireTokenOnBehalfOf({
      authority: `https://login.microsoftonline.com/${tid}`,
      oboAssertion: token,
      scopes: scopes,
      skipCache: true,
    });
    const accessToken = result?.accessToken;
    console.log('GraphAPI token is: ' + accessToken);

    if (!accessToken) {
      throw new HttpError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to acquire Microsoft Graph token. Please reload your app and try again.'
      );
    }

    cachedTokens.set(clientToken, accessToken);

    return accessToken;
  } catch (error) {
    console.error('Error acquiring token: ', error);
    return null;
  }
};
