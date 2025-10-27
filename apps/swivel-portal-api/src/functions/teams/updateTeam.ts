import { updateTeam, UpdateTeamInput } from '@swivel-portal/domain';
import { connectToDb } from '@swivel-portal/dal';
import { defineLambda } from '../../lambda/defineLambda';
import {
  authMiddleware,
  ExtrasWithUser,
} from '../../middleware/authMiddleware';
import { HttpError, Team } from '@swivel-portal/types';
import { StatusCodes } from 'http-status-codes';

export const handler = defineLambda<
  Partial<Team>,
  never,
  never,
  Team | null,
  ExtrasWithUser
>({
  log: true,
  middlewares: [authMiddleware],
  handler: async ({ body, extras }) => {
    await connectToDb();
    if (!extras.user.isAdmin) {
      throw new HttpError(StatusCodes.FORBIDDEN, 'Forbidden');
    }
    if (body.ownerId !== extras.user.azureAdId) {
      throw new HttpError(StatusCodes.FORBIDDEN, 'Forbidden');
    }
    return await updateTeam(body as UpdateTeamInput);
  },
});
