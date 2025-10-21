import { RepositoryContext } from '@swivel-portal/dal';

/**
 * Cancel a booking if owned by user and not in the past
 * @param bookingId - Booking ID
 * @param userId - User ID
 * @throws Error if not allowed
 */
export async function cancelBooking(bookingId: string, userId: string) {
  const booking = await RepositoryContext.bookingRepository.getById(bookingId);

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.userId !== userId) {
    throw new Error('Forbidden: not your booking');
  }

  const today = new Date().toISOString().slice(0, 10);
  if (booking.bookingDate < today) {
    throw new Error('Cannot cancel past bookings');
  }

  const updated = await RepositoryContext.bookingRepository.update(bookingId, {
    canceledAt: new Date(),
  });
  if (!updated) {
    throw new Error('Failed to cancel booking');
  }

  return true;
}
