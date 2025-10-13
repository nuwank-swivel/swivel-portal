import { IBookingRepository, Booking as BookingType } from '@swivel-portal/types';
import { Booking } from '../models/Booking.js';

export class BookingRepository implements IBookingRepository<BookingType> {
  countBookingsByDate(date: string): Promise<number> {
    throw new Error('Method not implemented.');
  }
  findBookingsByDateAndSeat(seatId: string, date: Date): Promise<BookingType[]> {
    throw new Error('Method not implemented.');
  }
  getById(id: string): Promise<BookingType | null> {
    throw new Error('Method not implemented.');
  }
  create(item: BookingType): Promise<BookingType> {
    throw new Error('Method not implemented.');
  }
  update(id: string, item: Partial<BookingType>): Promise<BookingType | null> {
    throw new Error('Method not implemented.');
  }
  delete(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  /**
   * Check if a seat is available (from create-booking feature)
   */
  async isSeatAvailable(seatId: string, date: Date): Promise<boolean> {
    try {
      const count = await Booking.countDocuments({ seatId, date }).exec();
      return count === 0;
    } catch (error) {
      console.log('Error checking seat availability:', error);
      return false;
    }
  }
}
