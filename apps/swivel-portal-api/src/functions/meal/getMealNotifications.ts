import { getMealNotifications } from '@swivel-portal/domain';
import { defineLambda } from '../../lambda/defineLambda';
import { authMiddleware, ExtrasWithUser } from '../../middleware/authMiddleware';
import { HttpError } from '@swivel-portal/types';

export const handler = defineLambda<never, { userId?: string }, never, { settings: Awaited<ReturnType<typeof getMealNotifications>> }, ExtrasWithUser>({
  middlewares: [authMiddleware],
  log: true,
  handler: async ({ query, extras }) => {
    const isAdmin = extras.user.isAdmin;
    const targetUserId = query.userId ?? extras.user.azureAdId;
    if (query.userId && !isAdmin) {
      throw new HttpError(403, 'Forbidden: admin access required to query other users');
    }
    const settings = await getMealNotifications(targetUserId);
    return { settings };
  },
});


