import {
  IBookingRepository,
  Booking as BookingType,
} from '@swivel-portal/types';
import { Booking } from '../models/Booking.js';

export class BookingRepository implements IBookingRepository<BookingType> {
  /**
   * Find all bookings for a specific date (admin use)
   * Returns user name, duration type, and meal type for each booking
   */
  async findAllBookingsByDate(date: string): Promise<
    Array<{
      userId: string;
      userName: string;
      durationType: string;
      lunchOption?: string;
    }>
  > {
    try {
      // Use aggregation to join with User collection
      const bookings = await Booking.aggregate([
        { $match: { bookingDate: date, canceledAt: null } },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: 'azureAdId',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            userId: 1,
            userName: {
              $ifNull: ['$user.name', ''],
            },
            durationType: 1,
            lunchOption: 1,
          },
        },
      ]);
      return bookings;
    } catch (error) {
      console.log('Error finding all bookings by date:', error);
      return [];
    }
  }
  /**
   * Find upcoming (future, not canceled) bookings for a user
   * @param userId - The user identifier
   * @param fromDate - Only bookings on or after this date (YYYY-MM-DD)
   */
  async findUserUpcomingBookings(
    userId: string,
    fromDate: string
  ): Promise<BookingType[]> {
    try {
      const bookings = await Booking.find({
        userId,
        bookingDate: { $gte: fromDate },
        canceledAt: null,
      })
        .sort({ bookingDate: 1 })
        .exec();
      return bookings.map((b) => b.toObject() as BookingType);
    } catch (error) {
      console.log('Error finding user upcoming bookings:', error);
      return [];
    }
  }
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

  async update(
    id: string,
    item: Partial<BookingType>
  ): Promise<BookingType | null> {
    try {
      // If canceledAt is provided as a string, convert to Date
      if (item.canceledAt && typeof item.canceledAt === 'string') {
        item.canceledAt = new Date(item.canceledAt) as Date;
      }
      const booking = await Booking.findByIdAndUpdate(id, item, {
        new: true,
      }).exec();
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
        canceledAt: null,
      }).exec();

      return count;
    } catch (error) {
      console.log('Error counting bookings by date:', error);
      return 0;
    }
  }

  /**
   * Check if a user has a booking on a specific date
   * @param userId - The user identifier
   * @param bookingDate - Date in YYYY-MM-DD format
   */
  async hasUserBookingOnDate(
    userId: string,
    bookingDate: string
  ): Promise<boolean> {
    try {
      const count = await Booking.countDocuments({
        userId,
        bookingDate,
        canceledAt: null,
      }).exec();
      return count > 0;
    } catch (error) {
      console.log('Error checking user booking on date:', error);
      return false;
    }
  }
}
