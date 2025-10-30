import { Team } from '@swivel-portal/types';
import { create } from 'zustand';

export interface TeamState {
  teams: Team[];
  setTeams: (teams: Team[]) => void;
}

export const useTeamState = create<TeamState>((set) => ({
  teams: [],
  setTeams: (teams: Team[]) => set({ teams }),
}));
