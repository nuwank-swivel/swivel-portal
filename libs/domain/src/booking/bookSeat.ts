import { BookingRepository } from '@swivel-portal/dal';
import { Booking } from '@swivel-portal/types';

// Helper function to map duration strings to enum values
function mapDurationToEnum(duration: string): 'hour' | 'half-day' | 'full-day' {
  const normalized = duration.toLowerCase().trim();
  
  if (normalized.includes('1 hour') || normalized === 'hour') {
    return 'hour';
  }
  if (normalized.includes('half') || normalized.includes('4 hours')) {
    return 'half-day';
  }
  if (normalized.includes('full') || normalized.includes('8 hours')) {
    return 'full-day';
  }
  
  // Default to full-day if unable to parse
  return 'full-day';
}

export async function bookSeat({ seatId, userId, date, duration, lunchOption }: {
  seatId: string;
  userId: string;
  date: Date | string;
  duration: string;
  lunchOption?: string;
}) {
  const bookingRepo = new BookingRepository();
  
  // Convert date to Date object if it's a string
  const bookingDate = typeof date === 'string' ? new Date(date) : date;
  
  // Validate date is not in the past (allow today)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset to start of day
  const bookingDateOnly = new Date(bookingDate);
  bookingDateOnly.setHours(0, 0, 0, 0); // Reset to start of day
  
  if (bookingDateOnly < today) {
    throw new Error('Booking date cannot be in the past');
  }
  
  // Check seat availability
  const available = await bookingRepo.isSeatAvailable(seatId, bookingDate);
  if (!available) {
    throw new Error('Seat is not available for the selected date');
  }
  
  // Map duration string to enum value
  const durationType = mapDurationToEnum(duration);
  
  // Create booking
  const bookingData: Booking = {
    seatId,
    userId,
    date: bookingDate,
    bookingDate: bookingDate.toISOString().split('T')[0], // YYYY-MM-DD format
    durationType,
    duration,
    lunchOption,
  };
  
  const booking = await bookingRepo.create(bookingData);
  return booking;
}