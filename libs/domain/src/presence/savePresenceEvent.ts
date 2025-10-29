import { connectToDb } from '@swivel-portal/dal';
import type { PresenceEvent } from '@swivel-portal/types';
import { RepositoryContext } from '@swivel-portal/dal';
export interface SavePresenceEventInput {
  userId: string;
  event: PresenceEvent;
  eta?: number;
  message?: string;
  timestamp?: Date;
}

export async function savePresenceEvent(
  input: SavePresenceEventInput
): Promise<void> {
  await connectToDb();
  await RepositoryContext.presenceEventRepository.create({
    userId: input.userId,
    event: input.event,
    eta: input.eta,
    message: input.message,
    timestamp: input.timestamp || new Date(),
  });
}
