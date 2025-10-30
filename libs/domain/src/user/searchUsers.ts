import { MsGraphApiService } from '../services/graphApi/msGraphApi.js';

/**
 * Search users by name or email (case-insensitive, partial match)
 */
export async function searchUsers(
  query: string,
  authToken: string
): Promise<string[]> {
  const msGraphService = new MsGraphApiService(authToken);

  const usersByEmail = await msGraphService.searchTenantUsersByEmail(query);

  return usersByEmail;
}
