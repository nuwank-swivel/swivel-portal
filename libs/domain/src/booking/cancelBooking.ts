import { RepositoryContext } from '@swivel-portal/dal';
import { HttpError } from '@swivel-portal/types';
import { StatusCodes } from 'http-status-codes';

/**
 * Cancel a booking if owned by user and not in the past
 * @param bookingId - Booking ID
 * @param userId - User ID
 * @throws Error if not allowed
 */
export async function cancelBooking(bookingId: string, userId: string) {
  const booking = await RepositoryContext.bookingRepository.getById(bookingId);

  if (!booking) {
    throw new HttpError(StatusCodes.NOT_FOUND, 'Booking not found');
  }

  if (booking.userId !== userId) {
    throw new HttpError(StatusCodes.FORBIDDEN, 'Forbidden: not your booking');
  }

  const today = new Date().toISOString().slice(0, 10);
  if (booking.bookingDate < today) {
    throw new HttpError(StatusCodes.BAD_REQUEST, 'Cannot cancel past bookings');
  }

  const updated = await RepositoryContext.bookingRepository.update(bookingId, {
    canceledAt: new Date(),
  });
  if (!updated) {
    throw new HttpError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to cancel booking'
    );
  }

  return true;
}
