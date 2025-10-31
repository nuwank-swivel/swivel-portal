import { connectToDb } from '@swivel-portal/dal';
import { updateBooking } from '@swivel-portal/domain';
import { defineLambda } from '../../lambda/defineLambda';
import { HttpError } from '@swivel-portal/types';
import {
  authMiddleware,
  ExtrasWithUser,
} from '../../middleware/authMiddleware';

export const handler = defineLambda<
  Record<string, unknown>,
  { date?: string },
  { id: string },
  { message: string },
  ExtrasWithUser
>({
  log: true,
  middlewares: [authMiddleware],
  handler: async ({ pathParameters, body, query, extras }) => {
    const userId = extras.user.azureAdId;
    const bookingId = pathParameters.id;
    if (!bookingId) {
      throw new HttpError(400, 'Missing booking id');
    }
    await connectToDb();
    await updateBooking(bookingId, userId, body, query);
    return { message: 'Booking updated' };
  },
});
