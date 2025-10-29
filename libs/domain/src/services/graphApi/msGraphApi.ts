import axios from 'axios';
import { getMSGraphToken } from './msGraphApiAuth.js';
import { HttpError } from '@swivel-portal/types';

const MS_GRAPH_API_BASE_URL = 'https://graph.microsoft.com/v1.0';

export class MsGraphApiService {
  private accessToken: string;
  private graphApiToken: string | null = null;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async init() {
    this.graphApiToken = await getMSGraphToken(this.accessToken);
  }

  private async callApi(
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' = 'GET',
    data?: any
  ) {
    if (this.graphApiToken === null) {
      await this.init();
    }

    const options: any = {
      headers: {
        Authorization: `Bearer ${this.graphApiToken}`,
        ConsistencyLevel: 'eventual',
        'Content-Type': 'application/json',
      },
    };
    if (method === 'GET') {
      const response = await axios.get(endpoint, options);
      console.log('request made to MS Graph API at: ' + new Date().toString());
      return response.data;
    } else if (method === 'POST') {
      const response = await axios.post(endpoint, data, options);
      console.log(
        'POST request made to MS Graph API at: ' + new Date().toString()
      );
      return response.data;
    }
  }
  // Unified method to update user presence
  async updatePresence(
    userId: string,
    presence: {
      availability: string;
      activity: string;
      expirationDuration?: string;
    }
  ) {
    const endpoint = `${MS_GRAPH_API_BASE_URL}/users/${userId}/presence/setUserPreferredPresence`;
    const presenceBody = {
      availability: presence.availability,
      activity: presence.activity,
      expirationDuration: presence.expirationDuration,
    };
    await this.callApi(endpoint, 'POST', presenceBody);
  }

  // Set status message for a user using Graph API
  async setStatusMessage(
    userId: string,
    content: string,
    expiryDateTime?: string,
    timeZone?: string
  ) {
    const endpoint = `${MS_GRAPH_API_BASE_URL}/users/${userId}/presence/setStatusMessage`;
    const statusMessageBody: any = {
      statusMessage: {
        message: {
          content,
          contentType: 'text',
        },
      },
    };
    if (expiryDateTime && timeZone) {
      statusMessageBody.statusMessage.expiryDateTime = {
        dateTime: expiryDateTime,
        timeZone,
      };
    }
    await this.callApi(endpoint, 'POST', statusMessageBody);
  }

  async searchTenantUsersByEmail(query: string): Promise<string[]> {
    const endpoint = `${MS_GRAPH_API_BASE_URL}/users?$search="mail:${query}"`;

    console.log('Searching users via endpoint: ', endpoint);
    try {
      const data = await this.callApi(endpoint);
      return data.value.map(({ mail }: { mail: string }) => mail);
    } catch (error) {
      if (error instanceof HttpError) {
        // will be handled by the api layer
        throw error;
      }

      console.error('Error searching users by email: ', error);
      return [];
    }
  }
}
