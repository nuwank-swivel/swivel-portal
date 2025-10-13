import { IBookingRepository, Booking as BookingType } from '@swivel-portal/types';
import { Booking } from '../models/Booking.js';

export class BookingRepository implements IBookingRepository<BookingType> {
    async getById(id: string): Promise<BookingType | null> {
    try {
      const booking = await Booking.findById(id).exec();
      if (!booking) {
        return null;
      }
      return booking.toObject() as BookingType;
    } catch (error) {
      console.log('Error fetching booking by ID:', error);
      return null;
    }
  }

  async create(item: BookingType): Promise<BookingType> {
    const newBooking = new Booking(item);
    await newBooking.save();
    return newBooking.toObject() as BookingType;
  }

  async update(id: string, item: Partial<BookingType>): Promise<BookingType | null> {
    try {
      const booking = await Booking.findByIdAndUpdate(id, item, { new: true }).exec();
      if (!booking) {
        return null;
      }
      return booking.toObject() as BookingType;
    } catch (error) {
      console.log('Error updating booking:', error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await Booking.findByIdAndDelete(id).exec();
      return result !== null;
    } catch (error) {
      console.log('Error deleting booking:', error);
      return false;
    }
  }

  /**
   * Count bookings for a specific date (excludes canceled bookings)
   */
  async countBookingsByDate(date: string): Promise<number> {
    try {
      const count = await Booking.countDocuments({ 
        bookingDate: date, 
        canceledAt: null 
      }).exec();
      
      return count;
    } catch (error) {
      console.log('Error counting bookings by date:', error);
      return 0;
    }
  }

  /**
   * Find bookings by seat and date (from create-booking feature)
   */
  async findBookingsByDateAndSeat(seatId: string, date: Date): Promise<BookingType[]> {
    try {
      const bookings = await Booking.find({ seatId, date }).exec();
      return bookings.map(b => b.toObject() as BookingType);
    } catch (error) {
      console.log('Error finding bookings by seat and date:', error);
      return [];
    }
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
