import { PresenceEventType } from '@swivel-portal/types';
import { create } from 'zustand';

export interface PresenceState {
  fetched: boolean;
  signin?: string;
  signoff?: string;
  afk: string[];
  back: string[];
  status: PresenceEventType;
  setPresenceState: (
    state: Omit<PresenceState, 'setPresenceState' | 'status' | 'setStatus'>
  ) => void;
  setStatus: (status: PresenceEventType) => void;
}

export const usePresenceState = create<PresenceState>((set) => ({
  fetched: false,
  signin: undefined,
  signoff: undefined,
  afk: [],
  back: [],
  status: PresenceEventType.Signoff,
  setPresenceState: (
    payload: Omit<PresenceState, 'setPresenceState' | 'status' | 'setStatus'>
  ) =>
    set((state) => ({
      ...state,
      ...payload,
    })),
  setStatus: (status: PresenceEventType) =>
    set((state) => ({ ...state, status })),
}));
