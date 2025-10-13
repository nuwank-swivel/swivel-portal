export interface User {
  _id?: string;
  azureAdId: string;
  name?: string;
  email: string;
}

export interface Booking {
  _id?: string;
  seatId?: string; // Added for create-booking feature
  userId: string;
  bookingDate: string; // YYYY-MM-DD format
  date?: Date; // Added for create-booking feature
  startTime?: string;
  endTime?: string;
  durationType: 'hour' | 'half-day' | 'full-day';
  duration?: string; // Alias for durationType (create-booking compatibility)
  lunchOption?: string;
  createdAt?: Date;
  updatedAt?: Date;
  canceledAt?: Date | null;
  canceledBy?: string | null;
}

export interface SeatConfiguration {
  _id?: string;
  defaultSeatCount: number;
  lastModified?: Date;
  modifiedBy?: string;
}

export interface DaySeatOverride {
  _id?: string;
  date: string; // YYYY-MM-DD format
  seatCount: number;
  createdAt?: Date;
  createdBy?: string;
}
