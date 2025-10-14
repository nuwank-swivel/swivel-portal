import { BookingRepository } from '@swivel-portal/dal';

/**
 * Get all bookings for a specific date (admin only)
 * Returns user name, duration type, and meal type for each booking
 */
export async function getAllBookingsForDate(date: string) {
  const repo = new BookingRepository();
  return repo.findAllBookingsByDate(date);
}
