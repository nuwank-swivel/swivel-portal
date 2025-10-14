/**
 * Admin: Get all bookings for a specific date
 */
export async function getAllBookingsForDate(date: string) {
  const response = await api.get<{ bookings: any[] }>(
    '/api/seatbooking/bookings',
    { params: { date } }
  );
  return response.data.bookings;
}
import api from '../axios';
import { SeatAvailabilityResponse, Booking } from '@swivel-portal/types';

/**
 * Fetch the authenticated user's upcoming bookings
 */
export async function getMyBookings(): Promise<Booking[]> {
  const response = await api.get<{ bookings: Booking[] }>(
    '/api/seatbooking/bookings/me'
  );
  return response.data.bookings;
}

/**
 * Cancel a booking by ID
 */
export async function cancelBooking(
  bookingId: string
): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(
    `/api/seatbooking/bookings/${bookingId}`
  );
  return response.data;
}

/**
 * Get seat availability for a specific date
 * @param date - Date in YYYY-MM-DD format
 */
export async function getSeatAvailability(
  date: string
): Promise<SeatAvailabilityResponse> {
  const response = await api.get<SeatAvailabilityResponse>(
    '/api/seatbooking/availability',
    {
      params: { date },
    }
  );
  return response.data;
}

/**
 * Create a new seat booking
 */
export interface CreateBookingRequest {
  date: string; // YYYY-MM-DD format
  duration: string; // e.g., "1 hour", "Half day", "Full day"
  lunchOption?: string;
}

export interface CreateBookingResponse {
  message: string;
  booking: Booking;
}

export async function createBooking(
  bookingData: CreateBookingRequest
): Promise<CreateBookingResponse> {
  const response = await api.post<CreateBookingResponse>(
    '/api/seatbooking/bookings',
    bookingData
  );
  return response.data;
}
