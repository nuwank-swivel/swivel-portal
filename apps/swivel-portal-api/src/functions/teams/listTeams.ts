import { listTeams } from '@swivel-portal/domain';
import { connectToDb } from '@swivel-portal/dal';
import { defineLambda } from '../../lambda/defineLambda';
import {
  authMiddleware,
  ExtrasWithUser,
} from '../../middleware/authMiddleware';
import { Team } from '@swivel-portal/types';

export const handler = defineLambda<
  never,
  never,
  never,
  Team[],
  ExtrasWithUser
>({
  log: true,
  middlewares: [authMiddleware],
  handler: async () => {
    await connectToDb();
    return await listTeams();
  },
});
