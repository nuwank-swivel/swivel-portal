import { Booking } from './domain.js';

export interface SeatAvailabilityResponse {
  date: string;
  defaultSeatCount: number;
  overrideSeatCount?: number;
  bookingsCount: number;
  availableSeats: number;
  bookedSeats: Booking[];
  myBooking?: {
    bookingId: string;
    seatId: string;
  };
}
