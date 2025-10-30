import { connectToDb } from '@swivel-portal/dal';
import { cancelBooking } from '@swivel-portal/domain';
import { defineLambda } from '../../lambda/defineLambda';
import { HttpError } from '@swivel-portal/types';
import {
  authMiddleware,
  ExtrasWithUser,
} from '../../middleware/authMiddleware';

export const handler = defineLambda<
  { date?: string },
  never,
  { id: string },
  { message: string },
  ExtrasWithUser
>({
  log: true,
  middlewares: [authMiddleware],
  handler: async ({ pathParameters, body, extras }) => {
    // Get userId from extras injected by authMiddleware
    const userId = extras.user.azureAdId;
    // Extract booking id from pathParameters
    const bookingId = pathParameters.id;
    if (!bookingId) {
      throw new HttpError(400, 'Missing booking id');
    }
    await connectToDb();
    await cancelBooking(
      bookingId,
      { userId, isAdmin: extras.user.isAdmin },
      body
    );
    return { message: 'Booking canceled' };
  },
});
