export interface IRepository<T> {
  getById(id: string): Promise<T | null>;
  create(item: T): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

// Specialized repository interfaces that extend base IRepository

export interface IBookingRepository<T> extends IRepository<T> {
  countBookingsByDate(date: string): Promise<number>;
  findBookingsByDateAndSeat(seatId: string, bookingDate: string): Promise<T[]>;
  isSeatAvailable(seatId: string, bookingDate: string): Promise<boolean>;
}

export interface ISeatConfigurationRepository<T> extends IRepository<T> {
  getDefaultConfig(): Promise<T | null>;
}

export interface IDaySeatOverrideRepository<T> extends IRepository<T> {
  getByDate(date: string): Promise<T | null>;
}
