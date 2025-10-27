export interface IRepository<T> {
  getById(id: string): Promise<T | null>;
  create(item: Omit<Partial<T>, '_id'>): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

// Specialized repository interfaces that extend base IRepository

export interface IBookingRepository<T> extends IRepository<T> {
  countBookingsByDate(date: string): Promise<number>;
  findUserUpcomingBookings(userId: string, fromDate: string): Promise<T[]>;
  hasUserBookingOnDate(userId: string, bookingDate: string): Promise<boolean>;
  findAllBookingsByDate(date: string): Promise<T[]>;
}

export interface IUserRepository<T> extends IRepository<T> {
  getByAzureAdId(azureAdId: string): Promise<T | null>;
  setTeamForUsers(emails: string[], teamId: string): Promise<void>;
}

export interface ISeatConfigurationRepository<T> extends IRepository<T> {
  getDefaultConfig(): Promise<T | null>;
}

export interface IDaySeatOverrideRepository<T> extends IRepository<T> {
  getByDate(date: string): Promise<T | null>;
}
