import { connectToDb } from '@swivel-portal/dal';
import { bookSeat } from '@swivel-portal/domain';
import { defineLambda } from '../../lambda/defineLambda';
import { Booking, HttpError } from '@swivel-portal/types';
import {
  authMiddleware,
  ExtrasWithUser,
} from '../../middleware/authMiddleware';

interface BookSeatBody {
  date: string;
  duration: string;
  seatId: string;
  lunchOption?: string;
}

export const handler = defineLambda<
  BookSeatBody,
  never,
  never,
  { message: string; booking: Booking },
  ExtrasWithUser
>({
  log: true,
  middlewares: [authMiddleware],
  handler: async ({ body, extras }) => {
    const userId = extras.user.azureAdId;
    const { date, duration, seatId, lunchOption } = body || {};

    if (!date || !duration || !seatId) {
      throw new HttpError(400, 'Missing required fields');
    }
    await connectToDb();
    const booking = await bookSeat({
      userId,
      date,
      duration,
      seatId,
      lunchOption,
    });
    return { message: 'Booking created', booking };
  },
});
