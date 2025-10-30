import { connectToDb, RepositoryContext } from '@swivel-portal/dal';
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
  // Optional: create the booking on behalf of another user (azureAdId)
  bookForUserId?: string;
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
  const { date, duration, seatId, lunchOption, recurring, bookForUserId } = body || {};
    if (!seatId) {
      throw new HttpError(400, 'Missing seatId');
    }
    await connectToDb();
    // If booking for someone else, ensure they exist in our DB and disallow recurring bookings
  let finalUserId = userId;
  if (bookForUserId) {
      // If booking for someone else (bookForUserId different from authenticated user)
      // recurring bookings are not allowed
      if (bookForUserId !== userId && recurring) {
        throw new HttpError(422, 'Recurring bookings are not allowed when booking for someone else');
      }

      // bookForUserId can be either an azureAdId or an email (frontend search returns emails)
      let targetUser = await RepositoryContext.userRepository.getByAzureAdId(
        bookForUserId
      );
      if (!targetUser) {
        // try email lookup
        targetUser = await RepositoryContext.userRepository.getByEmail(
          bookForUserId
        );
      }

      if (!targetUser) {
        // Clear, user-facing error per story acceptance criteria
        throw new HttpError(
          400,
          'Selected user does not have an account in Swivel. Ask them to sign in or contact admin.'
        );
      }
      // normalize the id we'll use for booking to the user's azureAdId
      // (in case frontend provided an email)
      finalUserId = targetUser.azureAdId;
    }
    // Unified seat booking logic: batch or single
    // Only one booking record, with recurring details if provided
    if (!date || !duration) {
      throw new HttpError(400, 'Missing required fields');
    }
    let booking;
    try {
      booking = await bookSeat({
        userId: finalUserId,
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
    } catch (err) {
      // If booking-for-other and the target user already has a booking, return a clear message
      if (
        bookForUserId &&
        err instanceof HttpError &&
        (err as HttpError).statusCode === 409
      ) {
        throw new HttpError(
          409,
          'Selected user already has a booking for this date'
        );
      }
      throw err;
    }

    return { message: 'Booking created', booking: [booking] };
  },
});
