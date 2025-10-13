import api from '../axios';
import { SeatAvailabilityResponse, Booking } from '@swivel-portal/types';

/**
 * Get seat availability for a specific date
 * @param date - Date in YYYY-MM-DD format
 */
export async function getSeatAvailability(date: string): Promise<SeatAvailabilityResponse> {
  const response = await api.get<SeatAvailabilityResponse>('/api/seatbooking/availability', {
    params: { date },
  });
  return response.data;
}

/**
 * Create a new seat booking
 */
export interface CreateBookingRequest {
  seatId: string;
  date: string; // ISO date string
  duration: string; // e.g., "1 hour", "Half day", "Full day"
  lunchOption?: string;
}

export interface CreateBookingResponse {
  message: string;
  booking: Booking;
}

export async function createBooking(bookingData: CreateBookingRequest): Promise<CreateBookingResponse> {
  const response = await api.post<CreateBookingResponse>('/api/seatbooking/bookings', bookingData);
  return response.data;
}
