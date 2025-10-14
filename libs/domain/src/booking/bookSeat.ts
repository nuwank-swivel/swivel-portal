import {
  BookingRepository,
  SeatConfigurationRepository,
  DaySeatOverrideRepository,
} from '@swivel-portal/dal';
import { Booking } from '@swivel-portal/types';

/**
 * Maps duration strings to standard duration types
 */
function mapDurationToEnum(duration: string): 'hour' | 'half-day' | 'full-day' {
  const normalized = duration.toLowerCase().trim();
  if (normalized.includes('1 hour') || normalized === 'hour') {
    return 'hour';
  }
  if (normalized.includes('half') || normalized.includes('4 hours')) {
    return 'half-day';
  }
  return 'full-day';
}

/**
 * Creates a new booking for a specific date
 *
 * @throws Error if date format is invalid
 * @throws Error if date is in the past
 * @throws Error if user already has a booking for the date
 * @throws Error if no seats are available for the date
 */
export async function bookSeat(params: {
  userId: string;
  date: string;
  duration: string;
  lunchOption?: string;
}): Promise<Booking> {
  const { userId, date, duration, lunchOption } = params;
  const bookingRepo = new BookingRepository();
  const configRepo = new SeatConfigurationRepository();
  const overrideRepo = new DaySeatOverrideRepository();

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }

  // Validate date is not in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bookingDate = new Date(date);
  bookingDate.setHours(0, 0, 0, 0);
  if (bookingDate < today) {
    throw new Error('Booking date cannot be in the past');
  }

  // Check if user already has a booking for this date
  const hasBooking = await bookingRepo.hasUserBookingOnDate(userId, date);
  if (hasBooking) {
    throw new Error('You already have a booking for this date');
  }

  // Get the max seat capacity for the date
  const config = await configRepo.getDefaultConfig();
  const defaultSeatCount = config?.defaultSeatCount ?? 50;
  const override = await overrideRepo.getByDate(date);
  const effectiveSeatCount = override?.seatCount ?? defaultSeatCount;

  // Check if seats are available
  const totalBookings = await bookingRepo.countBookingsByDate(date);
  if (totalBookings >= effectiveSeatCount) {
    throw new Error('No seats available for the selected date');
  }

  const durationType = mapDurationToEnum(duration);
  return await bookingRepo.create({
    userId,
    bookingDate: date,
    durationType,
    duration,
    lunchOption,
  });
}
