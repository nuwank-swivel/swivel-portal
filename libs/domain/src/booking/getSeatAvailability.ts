import { RepositoryContext } from '@swivel-portal/dal';
import { HttpError, SeatAvailabilityResponse } from '@swivel-portal/types';
import { StatusCodes } from 'http-status-codes';

export async function getSeatAvailability(date: string) {
  // Validate date parameter
  if (!date) {
    throw new HttpError(
      StatusCodes.BAD_REQUEST,
      'Missing required parameter: date'
    );
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new HttpError(
      StatusCodes.BAD_REQUEST,
      'Invalid date format. Expected YYYY-MM-DD'
    );
  }

  try {
    // Get default seat configuration
    const config =
      await RepositoryContext.seatConfigurationRepository.getDefaultConfig();
    const defaultSeatCount = config?.defaultSeatCount ?? 50; // Default to 50 if not configured

    // Check for date-specific override
    const override =
      await RepositoryContext.daySeatOverrideRepository.getByDate(date);
    const effectiveSeatCount = override?.seatCount ?? defaultSeatCount;

    // Get all bookings for the date
    const bookings =
      await RepositoryContext.bookingRepository.findAllBookingsByDate(date);
    const bookingsCount = bookings.length;
    const bookedSeatIds = bookings.map((b) => b.seatId);

    // Calculate available seats
    const availableSeats = Math.max(0, effectiveSeatCount - bookingsCount);

    const response: SeatAvailabilityResponse = {
      date,
      defaultSeatCount,
      overrideSeatCount: override?.seatCount,
      bookingsCount,
      availableSeats,
      bookedSeatIds,
    };

    return response;
  } catch (error) {
    console.error('Error getting seat availability:', error);
    throw new HttpError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to retrieve seat availability'
    );
  }
}
