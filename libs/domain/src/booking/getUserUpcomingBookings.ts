import { BookingRepository } from '@swivel-portal/dal';

/**
 * Get upcoming (future, not canceled) bookings for a user
 * @param userId - The user identifier
 * @param fromDate - Only bookings on or after this date (YYYY-MM-DD)
 */
export async function getUserUpcomingBookings(userId: string, fromDate: string) {
  const repo = new BookingRepository();
  return repo.findUserUpcomingBookings(userId, fromDate);
}