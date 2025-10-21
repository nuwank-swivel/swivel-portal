import { BookingRepository } from '@swivel-portal/dal';
import { Booking } from '@swivel-portal/types';

/**
 * Get upcoming (future, not canceled) bookings for a user
 * @param userId - The user identifier
 * @param fromDate - Only bookings on or after this date (YYYY-MM-DD)
 */
export async function getUserUpcomingBookings(
  userId: string,
  fromDate: string
): Promise<Booking[]> {
  const repo = new BookingRepository();
  return (await repo.findUserUpcomingBookings(userId, fromDate)).map((b) => ({
    ...b,
    _id: b._id?.toString(),
  }));
}
