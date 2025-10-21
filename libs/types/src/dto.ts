export interface SeatAvailabilityResponse {
  date: string;
  defaultSeatCount: number;
  overrideSeatCount?: number;
  bookingsCount: number;
  availableSeats: number;
}
