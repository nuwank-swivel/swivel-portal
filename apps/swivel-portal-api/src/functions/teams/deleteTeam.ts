import { deleteTeam } from '@swivel-portal/domain';
import { connectToDb } from '@swivel-portal/dal';
import { defineLambda } from '../../lambda/defineLambda';
import {
  authMiddleware,
  ExtrasWithUser,
} from '../../middleware/authMiddleware';
import { HttpError } from '@swivel-portal/types';
import { StatusCodes } from 'http-status-codes';

export const handler = defineLambda<
  { id: string },
  never,
  never,
  boolean,
  ExtrasWithUser
>({
  log: true,
  middlewares: [authMiddleware],
  handler: async ({ body, extras }) => {
    await connectToDb();

    if (!extras.user.isAdmin) {
      throw new HttpError(StatusCodes.FORBIDDEN, 'Forbidden');
    }
    return await deleteTeam(body.id, extras.user.azureAdId);
  },
});
