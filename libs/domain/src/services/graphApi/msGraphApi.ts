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

  private async callApi(endpoint: string) {
    if (this.graphApiToken === null) {
      await this.init();
    }

    const options = {
      headers: {
        Authorization: `Bearer ${this.graphApiToken}`,
        ConsistencyLevel: 'eventual',
      },
    };

    const response = await axios.get(endpoint, options);
    console.log('request made to MS Graph API at: ' + new Date().toString());
    return response.data;
  }

  private async init() {
    this.graphApiToken = await getMSGraphToken(this.accessToken);
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
