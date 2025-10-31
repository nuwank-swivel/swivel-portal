import { listMealNotifications } from '@swivel-portal/domain';
import { defineLambda } from '../../lambda/defineLambda';
import { authMiddleware, ExtrasWithUser } from '../../middleware/authMiddleware';
import { HttpError } from '@swivel-portal/types';

export const handler = defineLambda<never, never, never, { users: Awaited<ReturnType<typeof listMealNotifications>> }, ExtrasWithUser>({
  middlewares: [authMiddleware],
  log: true,
  handler: async ({ extras }) => {
    if (!extras.user.isAdmin) {
      throw new HttpError(403, 'Forbidden: admin access required');
    }
    const users = await listMealNotifications();
    return { users };
  },
});