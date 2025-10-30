import { HttpError, User } from '@swivel-portal/types';
import { Middleware } from '../lambda/defineLambda';

export interface ExtrasWithUser {
  user: User;
}

export const authMiddleware: Middleware<
  unknown,
  unknown,
  ExtrasWithUser
> = async ({ event }) => {
  const userId = event.requestContext.authorizer?.azureAdId;
  const userGraphId = event.requestContext.authorizer?.userGraphId;

  if (!userId) throw new HttpError(401, 'Unauthorized');

  const name = event.requestContext.authorizer?.name;
  const email = event.requestContext.authorizer?.email;
  const isAdmin =
    event.requestContext.authorizer?.isAdmin === true ||
    event.requestContext.authorizer?.isAdmin === 'true';

  return {
    extra: { user: { azureAdId: userId, name, email, isAdmin, userGraphId } },
  };
};
