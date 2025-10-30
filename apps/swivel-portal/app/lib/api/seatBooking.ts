import api from '../axios';
import { SeatAvailabilityResponse, Booking } from '@swivel-portal/types';

export async function updateBookingMeal(
  bookingId: string,
  date: string,
  lunchOption: string | null
) {
  return api.patch(`/api/seatbooking/bookings/${bookingId}`, {
    lunchOption,
    date,
  });
}

/**
 * Fetch seat layout from backend
 */
export async function getSeatLayout(): Promise<{
  tables: Array<{
    name: string;
    seats: Array<{ id: string; side: string; index: number }>;
  }>;
}> {
  const response = await api.get<{
    tables: Array<{
      name: string;
      seats: Array<{ id: string; side: string; index: number }>;
    }>;
  }>('/api/seatbooking/layout');
  return response.data;
}

/**
 * Admin: Get all bookings for a specific date
 */
export async function getAllBookingsForDate(date: string) {
  const response = await api.get<{ bookings: Booking[] }>(
    '/api/seatbooking/bookings',
    { params: { date } }
  );
  return response.data.bookings;
}

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
  bookingId: string,
  payload?: { date?: string }
): Promise<{ message: string }> {
  if (payload && payload.date) {
    // Send as body in DELETE request (some backends may require POST for this)
    const response = await api.delete<{ message: string }>(
      `/api/seatbooking/bookings/${bookingId}`,
      { data: payload }
    );
    return response.data;
  } else {
    const response = await api.delete<{ message: string }>(
      `/api/seatbooking/bookings/${bookingId}`
    );
    return response.data;
  }
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
  // For single booking
  date?: string; // YYYY-MM-DD format
  duration?: string; // e.g., "1 hour", "Half day", "Full day"
  seatId: string;
  lunchOption?: string;
  // For recurring booking
  recurring?: {
    daysOfWeek: string[];
    startDate: string;
    endDate?: string;
  };
  // Optional: create booking on behalf of another user (email or azureAdId)
  bookForUserId?: string;
}

export interface CreateBookingResponse {
  message: string;
  booking: Booking;
}

export async function createBooking(
  bookingData: CreateBookingRequest
): Promise<CreateBookingResponse> {
  // If daysOfWeek is present, treat as recurring booking
  const response = await api.post<CreateBookingResponse>(
    '/api/seatbooking/bookings',
    bookingData
  );
  return response.data;
}
