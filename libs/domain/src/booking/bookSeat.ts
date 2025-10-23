import { RepositoryContext } from '@swivel-portal/dal';
import { Booking } from '@swivel-portal/types';
import { HttpError } from '@swivel-portal/types';
import { StatusCodes } from 'http-status-codes';

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
  seatId: string;
  lunchOption?: string;
  recurring?: {
    daysOfWeek: string[];
    startDate: string;
    endDate?: string;
  };
}): Promise<Booking> {
  const { userId, date, duration, seatId, lunchOption, recurring } = params;
  // Validate seatId
  if (!seatId) {
    throw new HttpError(StatusCodes.BAD_REQUEST, 'Missing seatId');
  }

  // Check if seat is already booked for this date
  const bookingsForDate =
    await RepositoryContext.bookingRepository.findAllBookingsByDate(date);
  const seatBooked = bookingsForDate.some(
    (b) => b.seatId === seatId && !b.canceledAt
  );
  if (seatBooked) {
    throw new HttpError(
      StatusCodes.CONFLICT,
      'Seat is already booked for this date'
    );
  }

  const user = await RepositoryContext.userRepository.getByAzureAdId(userId);

  if (!user) {
    throw new HttpError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new HttpError(
      StatusCodes.BAD_REQUEST,
      'Invalid date format. Expected YYYY-MM-DD'
    );
  }

  // Validate date is not in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bookingDate = new Date(date);
  bookingDate.setHours(0, 0, 0, 0);
  if (bookingDate < today) {
    throw new HttpError(
      StatusCodes.BAD_REQUEST,
      'Booking date cannot be in the past'
    );
  }

  // Check if user already has a booking for this date
  const hasBooking =
    await RepositoryContext.bookingRepository.hasUserBookingOnDate(
      userId,
      date
    );
  if (hasBooking) {
    throw new HttpError(
      StatusCodes.CONFLICT,
      'You already have a booking for this date'
    );
  }

  // Get the max seat capacity for the date
  const config =
    await RepositoryContext.seatConfigurationRepository.getDefaultConfig();
  const defaultSeatCount = config?.defaultSeatCount ?? 50;
  const override = await RepositoryContext.daySeatOverrideRepository.getByDate(
    date
  );
  const effectiveSeatCount = override?.seatCount ?? defaultSeatCount;

  // Check if seats are available
  const totalBookings =
    await RepositoryContext.bookingRepository.countBookingsByDate(date);
  if (totalBookings >= effectiveSeatCount) {
    throw new HttpError(
      StatusCodes.CONFLICT,
      'No seats available for the selected date'
    );
  }

  const durationType = mapDurationToEnum(duration);

  const booking = await RepositoryContext.bookingRepository.create({
    userId,
    bookingDate: date,
    seatId,
    durationType,
    duration,
    lunchOption,
    recurring,
  });
  return { ...booking, _id: booking._id?.toString() };
}
