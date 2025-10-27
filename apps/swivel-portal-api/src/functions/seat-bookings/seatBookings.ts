import { connectToDb } from '@swivel-portal/dal';
import { bookSeat } from '@swivel-portal/domain';
import { defineLambda } from '../../lambda/defineLambda';
import { Booking, HttpError } from '@swivel-portal/types';
import {
  authMiddleware,
  ExtrasWithUser,
} from '../../middleware/authMiddleware';

interface BookSeatBody {
  // Single booking
  date?: string;
  duration?: string;
  seatId: string;
  lunchOption?: string;
  // Recurring booking
  recurring?: {
    daysOfWeek: string[];
    startDate: string;
    endDate?: string;
  };
}

export const handler = defineLambda<
  BookSeatBody,
  never,
  never,
  { message: string; booking: Booking[] },
  ExtrasWithUser
>({
  log: true,
  middlewares: [authMiddleware],
  handler: async ({ body, extras }) => {
    const userId = extras.user.azureAdId;
  const { date, duration, seatId, lunchOption, recurring } = body || {};
    if (!seatId) {
      throw new HttpError(400, 'Missing seatId');
    }
    await connectToDb();
    // Unified seat booking logic: batch or single
    // Only one booking record, with recurring details if provided
    if (!date || !duration) {
      throw new HttpError(400, 'Missing required fields');
    }
    const booking = await bookSeat({
      userId,
      date,
      duration,
      seatId,
      lunchOption,
      recurring: recurring ? {
        daysOfWeek: recurring.daysOfWeek,
        startDate: recurring.startDate,
        endDate: recurring.endDate,
      } : undefined,
    });
    return { message: 'Booking created', booking: [booking] };
  },
});
