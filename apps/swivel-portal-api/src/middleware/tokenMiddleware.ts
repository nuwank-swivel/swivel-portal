import { HttpError } from '@swivel-portal/types';
import { Middleware } from '../lambda/defineLambda';

export interface ExtrasWithAuthToken {
  authorizationToken: string;
}

export const authTokenMiddleware: Middleware<
  unknown,
  unknown,
  ExtrasWithAuthToken
> = async ({ event }) => {
  const authorizationToken = event.headers['Authorization'];

  if (!authorizationToken) throw new HttpError(401, 'Unauthorized');

  return { extra: { authorizationToken } };
};
