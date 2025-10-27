import * as msal from '@azure/msal-node';
import { HttpError } from '@swivel-portal/types';
import axios from 'axios';
import { StatusCodes } from 'http-status-codes';

let cachedToken: string | null = null;

const getMSGraphToken = async (clientToken: string) => {
  if (cachedToken) {
    console.log('Using cached MS Graph token');
    return cachedToken;
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
    console.log('Token is: ' + result?.accessToken);
    cachedToken = result?.accessToken ?? null;
    return result?.accessToken ?? '';
  } catch (error) {
    console.error('Error acquiring token: ', error);
    return null;
  }
};

async function callApi(endpoint: string, accessToken: string) {
  const options = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ConsistencyLevel: 'eventual',
    },
  };

  console.log('request made to MS Graph API at: ' + new Date().toString());

  try {
    const response = await axios.get(endpoint, options);
    return response.data;
  } catch (error) {
    console.log(error);
    return error;
  }
}

async function searchTenantUsersByEmail(
  query: string,
  accessToken: string
): Promise<string[]> {
  const endpoint = `https://graph.microsoft.com/v1.0/users?$search="mail:${query}"`;

  console.log('Searching users via endpoint: ', endpoint);
  try {
    const data = await callApi(endpoint, accessToken);
    return data.value.map(({ mail }: { mail: string }) => mail);
  } catch (error) {
    console.error('Error searching users by email: ', error);
    return [];
  }
}

/**
 * Search users by name or email (case-insensitive, partial match)
 */
export async function searchUsers(
  query: string,
  authToken: string
): Promise<string[]> {
  const token = await getMSGraphToken(authToken);

  if (!token) {
    throw new HttpError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to acquire Microsoft Graph token'
    );
  }

  const usersByEmail = await searchTenantUsersByEmail(query, token);

  return usersByEmail;
}
