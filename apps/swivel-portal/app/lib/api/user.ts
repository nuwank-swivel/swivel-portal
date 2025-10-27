import api from '../axios';

export interface UserSearchResult {
  _id: string;
  name: string;
  email: string;
}

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  if (!query) return [];
  const response = await api.get<UserSearchResult[]>('/users', {
    params: { query },
  });
  return response.data;
}
