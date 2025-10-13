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
  date: string; // YYYY-MM-DD format
  duration: string;
  lunchOption?: string;
}) {
  const bookingRepo = new BookingRepository();
  
  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }
  
  // Validate date is not in the past (allow today)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset to start of day
  const [year, month, day] = date.split('-').map(Number);
  const bookingDate = new Date(year, month - 1, day); // month is 0-indexed
  bookingDate.setHours(0, 0, 0, 0);
  
  if (bookingDate < today) {
    throw new Error('Booking date cannot be in the past');
  }
  
  // Check seat availability (using string date)
  const available = await bookingRepo.isSeatAvailable(seatId, date);
  if (!available) {
    throw new Error('Seat is not available for the selected date');
  }
  
  // Map duration string to enum value
  const durationType = mapDurationToEnum(duration);
  
  // Create booking with both date formats for compatibility
  const bookingData: Booking = {
    seatId,
    userId,
    date: bookingDate, // Date object for legacy compatibility
    bookingDate: date, // YYYY-MM-DD string (primary)
    durationType,
    duration,
    lunchOption,
  };
  
  const booking = await bookingRepo.create(bookingData);
  return booking;
}