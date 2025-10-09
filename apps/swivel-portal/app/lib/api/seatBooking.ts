import api from '../axios';

export interface SeatAvailability {
  date: string;
  defaultSeatCount: number;
  overrideSeatCount?: number;
  bookingsCount: number;
  availableSeats: number;
}

/**
 * Get seat availability for a specific date
 * @param date - Date in YYYY-MM-DD format
 */
export async function getSeatAvailability(date: string): Promise<SeatAvailability> {
  const response = await api.get<SeatAvailability>('/api/seatbooking/availability', {
    params: { date },
  });
  return response.data;
}

