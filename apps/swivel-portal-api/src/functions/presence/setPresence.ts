import { connectToDb } from '@swivel-portal/dal';
import { defineLambda } from '../../lambda/defineLambda';
import { HttpError } from '@swivel-portal/types';
import {
  authMiddleware,
  ExtrasWithUser,
} from '../../middleware/authMiddleware';
import { savePresenceEvent } from '@swivel-portal/domain';
import type { PresenceEventType } from '@swivel-portal/types';
import {
  authTokenMiddleware,
  ExtrasWithAuthToken,
} from '../../middleware/tokenMiddleware';

export const handler = defineLambda<
  { event: PresenceEventType; eta?: number; message?: string },
  never,
  never,
  { success: boolean },
  ExtrasWithUser & ExtrasWithAuthToken
>({
  log: true,
  middlewares: [authMiddleware, authTokenMiddleware],
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
      accessToken: extras.authorizationToken,
      userGraphId: extras.user.userGraphId,
    });

    return { success: true };
  },
});
