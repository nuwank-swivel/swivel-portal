import { loginUser } from '@swivel-portal/domain';
import { connectToDb } from '@swivel-portal/dal';
import { defineLambda } from '../../lambda/defineLambda';
import { HttpError, User } from '@swivel-portal/types';
import {
  authMiddleware,
  ExtrasWithUser,
} from '../../middleware/authMiddleware';

export const handler = defineLambda<never, never, never, User, ExtrasWithUser>({
  middlewares: [authMiddleware],
  handler: async ({ extras }) => {
    await connectToDb();
    const azureAdId = extras.user.azureAdId;
    if (!azureAdId) {
      throw new HttpError(400, 'Missing azureAdId');
    }
    const name = extras.user.name as string;
    const email = extras.user.email as string;
    const isAdmin = extras.user.isAdmin ?? false;
    const user = await loginUser(azureAdId, name, email, isAdmin);
    return user;
  },
  log: true,
});
