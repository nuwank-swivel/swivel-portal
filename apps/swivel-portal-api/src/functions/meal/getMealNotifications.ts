import { connectToDb, RepositoryContext } from '@swivel-portal/dal';
import { defineLambda } from '../../lambda/defineLambda';
import { authMiddleware, ExtrasWithUser } from '../../middleware/authMiddleware';
import { HttpError } from '@swivel-portal/types';

export const handler = defineLambda<never, { userId?: string }, never, { settings: { receiveDailyEmail: boolean; preferredTimeUTC?: string | null } | null }, ExtrasWithUser>({
  middlewares: [authMiddleware],
  log: true,
  handler: async ({ query, extras }) => {
    const isAdmin = extras.user.isAdmin;
    const targetUserId = query.userId ?? extras.user.azureAdId;
    if (query.userId && !isAdmin) {
      throw new HttpError(403, 'Forbidden: admin access required to query other users');
    }
    await connectToDb();
    const settings = await RepositoryContext.mealNotificationSettingsRepository.getByUserId(targetUserId);
    if (!settings) return { settings: null };
    return { settings: { receiveDailyEmail: settings.receiveDailyEmail, preferredTimeUTC: settings.preferredTimeUTC } };
  },
});


