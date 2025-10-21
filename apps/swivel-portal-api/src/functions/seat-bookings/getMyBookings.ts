import { connectToDb } from '@swivel-portal/dal';
import { getUserUpcomingBookings } from '@swivel-portal/domain';
import { defineLambda } from '../../lambda/defineLambda';
import { Booking } from '@swivel-portal/types';
import {
  authMiddleware,
  ExtrasWithUser,
} from '../../middleware/authMiddleware';

export const handler = defineLambda<
  never,
  never,
  never,
  { bookings: Booking[] },
  ExtrasWithUser
>({
  log: true,
  middlewares: [authMiddleware],
  handler: async ({ extras }) => {
    const userId = extras.user.azureAdId;
    await connectToDb();
    const now = new Date();
    const today = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const bookings = await getUserUpcomingBookings(userId, today);
    return { bookings };
  },
});
