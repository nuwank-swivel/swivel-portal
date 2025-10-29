import api from '../axios';
import type {
  PresenceEventRecord,
  PresenceEventType,
} from '@swivel-portal/types';

export async function setPresence(
  event: PresenceEventType,
  eta?: number,
  message?: string
) {
  await api.post('/api/presence', { event, eta, message });
}

export async function getPresence(
  date?: string
): Promise<PresenceEventRecord[]> {
  const res = await api.get('/api/presence/me', {
    params: date ? { date } : undefined,
  });
  return res.data.events || [];
}
