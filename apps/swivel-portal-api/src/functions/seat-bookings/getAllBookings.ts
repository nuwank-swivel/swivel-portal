import { connectToDb } from '@swivel-portal/dal';
import { getAllBookingsForDate } from '@swivel-portal/domain';
import { defineLambda } from '../../lambda/defineLambda';
import { Booking, HttpError } from '@swivel-portal/types';
import {
  authMiddleware,
  ExtrasWithUser,
} from '../../middleware/authMiddleware';

export const handler = defineLambda<
  never,
  { date?: string },
  never,
  { bookings: Booking[] },
  ExtrasWithUser
>({
  log: true,
  middlewares: [authMiddleware],
  handler: async ({ query, extras }) => {
    if (!extras.user.isAdmin) {
      throw new HttpError(403, 'Forbidden: admin access required');
    }
    const date = query.date;
    if (!date) {
      throw new HttpError(400, 'Missing date parameter');
    }
    await connectToDb();
    const bookings = await getAllBookingsForDate(date);
    return { bookings };
  },
});
