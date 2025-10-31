import { connectToDb } from '@swivel-portal/dal';
import { defineLambda } from '../../lambda/defineLambda';
import { HttpError } from '@swivel-portal/types';
import {
  authMiddleware,
  ExtrasWithUser,
} from '../../middleware/authMiddleware';
import {
  getPresenceEventsByUser,
  getPresenceEventsByUserAndDate,
} from '@swivel-portal/domain';
import type { PresenceEventRecord } from '@swivel-portal/types';

export const handler = defineLambda<
  never,
  { date?: string },
  never,
  { events: PresenceEventRecord[] },
  ExtrasWithUser
>({
  log: true,
  middlewares: [authMiddleware],
  handler: async ({ query, extras }) => {
    await connectToDb();
    const userId = extras.user.azureAdId;
    if (!userId) throw new HttpError(400, 'Missing userId');
    const date = query?.date;

    let events: PresenceEventRecord[] = [];
    if (date) {
      // Get all events for the date, then filter by user
      events = await getPresenceEventsByUserAndDate(userId, date);
    } else {
      events = await getPresenceEventsByUser(userId);
    }
    return { events };
  },
});
