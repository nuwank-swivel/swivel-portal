import { getSeatAvailability } from '@swivel-portal/domain';
import { connectToDb } from '@swivel-portal/dal';
import { defineLambda } from '../../lambda/defineLambda';
import { HttpError, SeatAvailabilityResponse } from '@swivel-portal/types';
import {
  authMiddleware,
  ExtrasWithUser,
} from '../../middleware/authMiddleware';

export const handler = defineLambda<
  never,
  { date?: string },
  never,
  SeatAvailabilityResponse,
  ExtrasWithUser
>({
  log: true,
  middlewares: [authMiddleware],
  handler: async ({ query, extras }) => {
    await connectToDb();
    const date = query.date as string;
    if (!date) {
      throw new HttpError(400, 'Missing required parameter: date');
    }
    const userId = extras.user.azureAdId;
    const result = await getSeatAvailability(date, userId);

    return result;
  },
});
