export interface SeatAvailabilityResponse {
  date: string;
  defaultSeatCount: number;
  overrideSeatCount?: number;
  bookingsCount: number;
  availableSeats: number;
  bookedSeatIds: string[];
  myBooking?: {
    bookingId: string;
    seatId: string;
  };
}
