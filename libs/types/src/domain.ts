export interface PresenceEventRecord {
  _id?: string;
  userId: string;
  event: PresenceEventType;
  eta?: number;
  timestamp: Date;
}
export enum PresenceEventType {
  Signin = 'signin',
  Signoff = 'signoff',
  Afk = 'afk',
  Back = 'back',
}
export type PresenceEvent = 'signin' | 'signoff' | 'afk' | 'back';
export interface User {
  _id?: string;
  azureAdId: string;
  name?: string;
  email: string;
  isAdmin?: boolean;
  teamId?: string;
}

export interface Booking {
  _id?: string;
  userId: string;
  bookingDate: string; // YYYY-MM-DD format
  seatId: string;
  durationType: 'hour' | 'half-day' | 'full-day';
  duration?: string; // Alias for durationType (create-booking compatibility)
  lunchOption?: string;
  recurring?: {
    daysOfWeek: string[];
    startDate: string;
    endDate?: string;
  };
  overrides?: Array<{
    date: string;
    cancelledAt?: Date;
    lunchOption?: string;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
  canceledAt?: Date | null;
  canceledBy?: string | null;
  team?: {
    name: string;
    color: string;
  };
  user?: User;
}

export interface SeatConfiguration {
  _id?: string;
  defaultSeatCount: number;
  lastModified?: Date;
  modifiedBy?: string;
  tables: Table[];
}

export interface Table {
  name: string;
  seats: Array<{ id: string; side: string; index: number }>;
}

export interface DaySeatOverride {
  _id?: string;
  date: string; // YYYY-MM-DD format
  seatCount: number;
  createdAt?: Date;
  createdBy?: string;
}

export interface Team {
  _id?: string;
  name: string;
  color: string; // hex code
  ownerId: string; // admin user who created the team
  members: string[];
  deleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
