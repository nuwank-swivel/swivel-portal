import { connectToDb, RepositoryContext } from '@swivel-portal/dal';
import { defineLambda } from '../../lambda/defineLambda';
import { authMiddleware, ExtrasWithUser } from '../../middleware/authMiddleware';
import { HttpError } from '@swivel-portal/types';

interface PutBody {
  userId?: string; // if absent, apply to self
  receiveDailyEmail: boolean;
  preferredTimeUTC?: string | null;
}

export const handler = defineLambda<PutBody, never, never, { ok: true }, ExtrasWithUser>({
  middlewares: [authMiddleware],
  log: true,
  handler: async ({ body, extras }) => {
    if (!body) throw new HttpError(400, 'Invalid body');
    const isAdmin = extras.user.isAdmin;
    const targetUserId = body.userId ?? extras.user.azureAdId;
    if (body.userId && !isAdmin) {
      throw new HttpError(403, 'Forbidden: admin access required to set for other users');
    }
    await connectToDb();
    await RepositoryContext.mealNotificationSettingsRepository.setForUser(targetUserId, {
      receiveDailyEmail: body.receiveDailyEmail,
      preferredTimeUTC: body.preferredTimeUTC ?? null,
    });
    return { ok: true };
  },
});


