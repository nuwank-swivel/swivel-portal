import { createTeam } from '@swivel-portal/domain';
import { connectToDb } from '@swivel-portal/dal';
import { defineLambda } from '../../lambda/defineLambda';
import {
  authMiddleware,
  ExtrasWithUser,
} from '../../middleware/authMiddleware';
import { HttpError, Team } from '@swivel-portal/types';
import { StatusCodes } from 'http-status-codes';

export const handler = defineLambda<
  never,
  never,
  { name: string; color: string },
  Team,
  ExtrasWithUser
>({
  log: true,
  middlewares: [authMiddleware],
  handler: async ({ body, extras }) => {
    await connectToDb();
    // Only admins can create teams
    if (!extras.user.isAdmin) {
      throw new Error('Forbidden');
    }

    const { name, color } = body;

    if (!name || !color) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Name and color are required to create a team'
      );
    }

    const team = await createTeam({
      name,
      color,
      ownerId: extras.user.azureAdId,
    });
    return team;
  },
});
