export interface User {
  _id?: string;
  azureAdId: string;
  name?: string;
  email: string;
}

export interface Booking {
  _id?: string;
  userId: string;
  bookingDate: string; // YYYY-MM-DD format
  startTime?: string;
  endTime?: string;
  durationType: 'hour' | 'half-day' | 'full-day';
  lunchOption?: string;
  createdAt?: Date;
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
