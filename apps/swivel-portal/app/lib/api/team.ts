import { Team } from '@swivel-portal/types';
import api from '../axios';

export async function getTeams(): Promise<Team[]> {
  const response = await api.get<Team[]>('/api/team');
  return response.data;
}

export async function createTeam(data: {
  name: string;
  color: string;
  members?: string[];
}): Promise<Team> {
  const response = await api.post<Team>('/api/team', data);
  return response.data;
}

export async function updateTeam(data: Partial<Team>): Promise<Team> {
  const response = await api.put<Team>('/api/team', data);
  return response.data;
}

export async function deleteTeam(id: string): Promise<{ success: boolean }> {
  const response = await api.delete<{ success: boolean }>('/api/team', {
    data: { id },
  });
  return response.data;
}
