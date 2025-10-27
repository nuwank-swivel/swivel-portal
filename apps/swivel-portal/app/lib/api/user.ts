import api from '../axios';

export async function searchUsers(query: string): Promise<string[]> {
  if (!query) return [];
  const response = await api.get<string[]>('/api/user', {
    params: { query },
  });
  return response.data;
}
