import { BookingRepository } from '@swivel-portal/dal';
import { Booking } from '@swivel-portal/types';

export async function bookSeat({ seatId, userId, date, duration, lunchOption }: {
  seatId: string;
  userId: string;
  date: Date;
  duration: string;
  lunchOption?: string;
}) {
  const bookingRepo = new BookingRepository();
  
  // Validate date is in the future
  const now = new Date();
  if (new Date(date) < now) {
    throw new Error('Booking date must be in the future');
  }
  
  // Check seat availability
  const available = await bookingRepo.isSeatAvailable(seatId, date);
  if (!available) {
    throw new Error('Seat is not available for the selected date');
  }
  
  // Create booking
  const bookingData: Booking = {
    seatId,
    userId,
    date,
    bookingDate: date.toISOString().split('T')[0], // YYYY-MM-DD format
    durationType: duration as 'hour' | 'half-day' | 'full-day',
    duration,
    lunchOption,
  };
  
  const booking = await bookingRepo.create(bookingData);
  return booking;
}