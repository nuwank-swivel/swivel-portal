export interface User {
  _id?: string;
  azureAdId: string;
  name?: string;
  email: string;
  isAdmin?: boolean;
}

export interface Booking {
  _id?: string;
  userId: string;
  bookingDate: string; // YYYY-MM-DD format
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
