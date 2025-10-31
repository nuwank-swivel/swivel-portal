import { connectToDb } from '@swivel-portal/dal';
import type { PresenceEventType } from '@swivel-portal/types';
import { RepositoryContext } from '@swivel-portal/dal';
import { MsGraphApiService } from '../services/graphApi/msGraphApi.js';
export interface SavePresenceEventInput {
  userId: string;
  event: PresenceEventType;
  eta?: number;
  message?: string;
  timestamp?: Date;
  accessToken: string; // For Graph API integration
  userGraphId: string;
}

export async function savePresenceEvent(
  input: SavePresenceEventInput
): Promise<void> {
  await connectToDb();
  const { event, eta, message, userId, accessToken, userGraphId } = input;
  await RepositoryContext.presenceEventRepository.create({
    userId,
    event,
    eta,
    message,
    timestamp: input.timestamp || new Date(),
  });

  // Graph API integration for AFK/Back events
  if (input.accessToken) {
    const graphClient = new MsGraphApiService(accessToken);
    if (event === 'afk') {
      await graphClient.updatePresence(userGraphId, {
        availability: 'Away',
        activity: 'Away',
        expirationDuration: eta ? `PT${eta}M` : undefined,
      });
      await graphClient.setStatusMessage(userGraphId, message || '');
    } else if (event === 'back') {
      await graphClient.updatePresence(userGraphId, {
        availability: 'Available',
        activity: 'Available',
        expirationDuration: undefined,
      });
      await graphClient.setStatusMessage(userGraphId, '');
    }
  }
}
