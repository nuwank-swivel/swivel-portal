import { IBookingRepository } from '@swivel-portal/types';
import { Booking } from '../models/Booking.js';
import { BaseRepository } from './BaseRepository.js';

export class BookingRepository
  extends BaseRepository<Booking>
  implements IBookingRepository<Booking>
{
  constructor() {
    super(Booking);
  }

  async findAllBookingsByDate(date: string): Promise<Array<Booking>> {
    const bookings = await this.repository.find({
      where: { bookingDate: date, canceledAt: null },
      relations: {
        user: true,
      },
    });

    return bookings;
  }

  async findUserUpcomingBookings(
    userId: string,
    fromDate: string
  ): Promise<Booking[]> {
    return this.repository.find({
      where: {
        userId,
        bookingDate: { $gte: fromDate },
        canceledAt: null,
      },
      order: { bookingDate: 'ASC' },
    });
  }

  async countBookingsByDate(date: string): Promise<number> {
    return this.repository.count({
      where: { bookingDate: date, canceledAt: null },
    });
  }

  async hasUserBookingOnDate(
    userId: string,
    bookingDate: string
  ): Promise<boolean> {
    const count = await this.repository.count({
      where: { userId, bookingDate, canceledAt: null },
    });
    return count > 0;
  }
}
