import { connectToDb, RepositoryContext } from '@swivel-portal/dal';
import { defineLambda } from '../../lambda/defineLambda';
import { authMiddleware, ExtrasWithUser } from '../../middleware/authMiddleware';
import { HttpError } from '@swivel-portal/types';

// Returns all users with receiveDailyEmail enabled (admin only)
export const handler = defineLambda<never, never, never, { users: { userId: string; addedBy?: string; updatedBy?: string; updatedAt?: Date }[] }, ExtrasWithUser>({
  middlewares: [authMiddleware],
  log: true,
  handler: async ({ extras }) => {
    if (!extras.user.isAdmin) {
      throw new HttpError(403, 'Forbidden: admin access required');
    }
    await connectToDb();
    const enabled = await RepositoryContext.mealNotificationSettingsRepository.listAllEnabled();
    // Return userId, addedBy, updatedBy, updatedAt for each enabled user
    return {
      users: enabled.map(u => ({
        userId: u.userId,
        addedBy: u.addedBy,
        updatedBy: u.updatedBy,
        updatedAt: u.updatedAt,
      })),
    };
  },
});