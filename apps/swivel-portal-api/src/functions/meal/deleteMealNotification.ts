import { deleteMealNotification } from '@swivel-portal/domain';
import { defineLambda } from '../../lambda/defineLambda';
import { authMiddleware, ExtrasWithUser } from '../../middleware/authMiddleware';
import { HttpError } from '@swivel-portal/types';

interface DeleteBody {
  userEmail?: string;
}

export const handler = defineLambda<DeleteBody, any, any, { ok: true }, ExtrasWithUser>({
  middlewares: [authMiddleware],
  log: true,
  handler: async ({ body, extras }) => {
    if (!body) throw new HttpError(400, 'Invalid body');
    const { user } = extras;
    const isAdmin = user.isAdmin;
    const targetUserEmail = body.userEmail ?? user.email;
    if (body.userEmail && !isAdmin) {
      throw new HttpError(403, 'Forbidden: admin access required to delete for other users');
    }
    await deleteMealNotification({
      userEmail: targetUserEmail,
      actor: user.email || user.azureAdId,
    });
    return { ok: true };
  },
});