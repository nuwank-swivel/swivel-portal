import { connectToDb } from '@swivel-portal/dal';
import { defineLambda } from '../../lambda/defineLambda';
import {
  authTokenMiddleware,
  ExtrasWithAuthToken,
} from '../../middleware/tokenMiddleware';
import { searchUsers } from '@swivel-portal/domain';

export const handler = defineLambda<
  never,
  { query: string },
  never,
  string[],
  ExtrasWithAuthToken
>({
  log: true,
  middlewares: [authTokenMiddleware],
  handler: async ({ query: queryParams, extras }) => {
    await connectToDb();
    const { query } = queryParams;
    const { authorizationToken } = extras;
    return await searchUsers(query, authorizationToken);
  },
});
