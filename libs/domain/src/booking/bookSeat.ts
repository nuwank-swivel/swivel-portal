import { BookingRepository } from '@swivel-portal/dal';

export async function bookSeat({ seatId, userId, date, duration, lunchOption }: {
  seatId: string;
  userId: string;
  date: Date;
  duration: string;
  lunchOption?: string;
}) {
  // Validate date is in the future
  const now = new Date();
  if (new Date(date) < now) {
    throw new Error('Booking date must be in the future');
  }
  // Check seat availability
  const available = await BookingRepository.isSeatAvailable(seatId, date);
  if (!available) {
    throw new Error('Seat is not available for the selected date');
  }
  // Create booking
  const booking = await BookingRepository.createBooking({ seatId, userId, date, duration, lunchOption });
  return booking;
}