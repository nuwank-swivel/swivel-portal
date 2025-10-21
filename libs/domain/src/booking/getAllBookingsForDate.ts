import { BookingRepository } from '@swivel-portal/dal';
import { Booking } from '@swivel-portal/types';

/**
 * Get all bookings for a specific date (admin only)
 * Returns user name, duration type, and meal type for each booking
 */
export async function getAllBookingsForDate(date: string): Promise<Booking[]> {
  const repo = new BookingRepository();
  return (await repo.findAllBookingsByDate(date)).map((b) => ({
    ...b,
    _id: b._id?.toString(),
  }));
}
