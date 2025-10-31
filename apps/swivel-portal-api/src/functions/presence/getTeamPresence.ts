import { connectToDb } from '@swivel-portal/dal';
import { defineLambda } from '../../lambda/defineLambda';
import { HttpError } from '@swivel-portal/types';
import {
  authMiddleware,
  ExtrasWithUser,
} from '../../middleware/authMiddleware';
import type { PresenceEventRecord } from '@swivel-portal/types';
import {
  getPresenceEventsByDate,
  getTeamPresenceForUser,
} from '@swivel-portal/domain';

export const handler = defineLambda<
  never,
  { date: string },
  never,
  { events: PresenceEventRecord[] },
  ExtrasWithUser
>({
  log: true,
  middlewares: [authMiddleware],
  handler: async ({ query, extras }) => {
    await connectToDb();
    const { date } = query || {};
    if (!date) throw new HttpError(400, 'Missing date');
    const user = extras.user;
    if (user.isAdmin) {
      // Admin: return all records for the date
      const events = await getPresenceEventsByDate(date);
      return { events };
    } else {
      // Non-admin: pass azureAdId to domain layer, which will resolve teamId and fetch presence
      const events = await getTeamPresenceForUser(user.azureAdId, date);
      return { events };
    }
  },
});
