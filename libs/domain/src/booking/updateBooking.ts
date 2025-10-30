import { RepositoryContext } from '@swivel-portal/dal';
import { HttpError } from '@swivel-portal/types';
import { StatusCodes } from 'http-status-codes';

/**
 * Update a booking (single or recurring occurrence override)
 * @param bookingId - Booking ID
 * @param userId - User ID
 * @param updates - Fields to update (any booking field)
 * @param options - { date?: string } for recurring occurrence
 */
export async function updateBooking(
  bookingId: string,
  userId: string,
  updates: Record<string, unknown>,
  options?: { date?: string }
) {
  const booking = await RepositoryContext.bookingRepository.getById(bookingId);
  if (!booking) {
    throw new HttpError(StatusCodes.NOT_FOUND, 'Booking not found');
  }
  if (booking.userId !== userId) {
    throw new HttpError(StatusCodes.FORBIDDEN, 'Forbidden: not your booking');
  }
  // If recurring and date provided, add/update override for that date
  if (booking.recurring && options?.date) {
    const today = new Date().toISOString().slice(0, 10);
    if (options.date < today) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Cannot update past bookings'
      );
    }
    const overrides = Array.isArray(booking.overrides) ? booking.overrides : [];
    // Find if override exists for this date
    const idx = overrides.findIndex((o) => o.date === options.date);
    if (idx >= 0) {
      overrides[idx] = { ...overrides[idx], ...updates, date: options.date };
    } else {
      overrides.push({ ...updates, date: options.date });
    }
    const updated = await RepositoryContext.bookingRepository.update(
      bookingId,
      { overrides }
    );
    if (!updated) {
      throw new HttpError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to update booking occurrence'
      );
    }
    return true;
  }
  // Otherwise, update the original booking
  const updated = await RepositoryContext.bookingRepository.update(
    bookingId,
    updates
  );
  if (!updated) {
    throw new HttpError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to update booking'
    );
  }
  return true;
}
