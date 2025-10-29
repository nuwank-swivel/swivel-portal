import { connectToDb } from '@swivel-portal/dal';
import { defineLambda } from '../../lambda/defineLambda';
import { HttpError } from '@swivel-portal/types';
import {
  authMiddleware,
  ExtrasWithUser,
} from '../../middleware/authMiddleware';
import { savePresenceEvent } from '@swivel-portal/domain';
import type { PresenceEvent } from '@swivel-portal/types';

export const handler = defineLambda<
  { event: PresenceEvent; eta?: number; message?: string },
  never,
  never,
  { success: boolean },
  ExtrasWithUser
>({
  log: true,
  middlewares: [authMiddleware],
  handler: async ({ body, extras }) => {
    await connectToDb();
    const { event, eta, message } = body;
    const userId = extras.user.azureAdId;
    if (!event) throw new HttpError(400, 'Missing event type');

    // TODO: Update Teams presence/status via Graph API
    // await updateTeamsPresence(userId, event, eta);

    // Store event in DB via domain logic
    await savePresenceEvent({
      userId,
      event,
      eta,
      message,
      timestamp: new Date(),
    });

    return { success: true };
  },
});
