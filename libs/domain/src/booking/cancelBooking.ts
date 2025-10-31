import { RepositoryContext } from '@swivel-portal/dal';
import { HttpError } from '@swivel-portal/types';
import { StatusCodes } from 'http-status-codes';

/**
 * Cancel a booking if owned by user and not in the past
 * @param bookingId - Booking ID
 * @param requester - Requesting user context
 * @throws Error if not allowed
 */
export async function cancelBooking(
  bookingId: string,
  requester: { userId: string; isAdmin?: boolean },
  options?: { date?: string }
) {
  const booking = await RepositoryContext.bookingRepository.getById(bookingId);

  if (!booking) {
    throw new HttpError(StatusCodes.NOT_FOUND, 'Booking not found');
  }

  const { userId, isAdmin } = requester;
  const isAdminUser = Boolean(isAdmin);

  if (!isAdminUser && booking.userId !== userId) {
    throw new HttpError(StatusCodes.FORBIDDEN, 'Forbidden: not your booking');
  }

  const today = new Date().toISOString().slice(0, 10);

  // If recurring and date provided, add override for that date
  if (booking.recurring && options?.date) {
    // Only allow future dates
    if (options.date < today) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Cannot cancel past bookings'
      );
    }
    // Add override for this date
    const overrides = Array.isArray(booking.overrides) ? booking.overrides : [];
    overrides.push({
      date: options.date,
      cancelledAt: new Date(),
    });
    const updated = await RepositoryContext.bookingRepository.update(
      bookingId,
      {
        overrides,
      }
    );
    if (!updated) {
      throw new HttpError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to cancel booking occurrence'
      );
    }
    return true;
  }

  // Otherwise, cancel the whole booking
  if (booking.bookingDate < today) {
    throw new HttpError(StatusCodes.BAD_REQUEST, 'Cannot cancel past bookings');
  }
  const updated = await RepositoryContext.bookingRepository.update(bookingId, {
    canceledAt: new Date(),
    canceledBy: userId,
  });
  if (!updated) {
    throw new HttpError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to cancel booking'
    );
  }
  return true;
}
