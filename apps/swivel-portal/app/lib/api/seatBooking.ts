import api from '../axios';
import { SeatAvailabilityResponse } from '@swivel-portal/types';

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

