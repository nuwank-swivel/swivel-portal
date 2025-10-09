import { 
  BookingRepository, 
  SeatConfigurationRepository, 
  DaySeatOverrideRepository 
} from '@swivel-portal/dal';

export interface SeatAvailabilityResponse {
  date: string;
  defaultSeatCount: number;
  overrideSeatCount?: number;
  bookingsCount: number;
  availableSeats: number;
}

export async function getSeatAvailability(date: string) {
  // Validate date parameter
  if (!date) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Missing required parameter: date',
      }),
    };
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Invalid date format. Expected YYYY-MM-DD',
      }),
    };
  }

  try {
    const configRepo = new SeatConfigurationRepository();
    const overrideRepo = new DaySeatOverrideRepository();
    const bookingRepo = new BookingRepository();

    // Get default seat configuration
    const config = await configRepo.getDefaultConfig();
    const defaultSeatCount = config?.defaultSeatCount ?? 50; // Default to 50 if not configured

    // Check for date-specific override
    const override = await overrideRepo.getByDate(date);
    const effectiveSeatCount = override?.seatCount ?? defaultSeatCount;

    // Count bookings for the date
    const bookingsCount = await bookingRepo.countBookingsByDate(date);

    // Calculate available seats
    const availableSeats = Math.max(0, effectiveSeatCount - bookingsCount);

    const response: SeatAvailabilityResponse = {
      date,
      defaultSeatCount,
      overrideSeatCount: override?.seatCount,
      bookingsCount,
      availableSeats,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Error getting seat availability:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to retrieve seat availability',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}

