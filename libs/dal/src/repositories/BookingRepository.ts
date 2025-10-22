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
    const bookings = await this.repository
      .aggregate([
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
            seatId: 1,
          },
        },
      ])
      .toArray();

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
      bookingDate: date,
      canceledAt: null,
    });
  }

  async hasUserBookingOnDate(
    userId: string,
    bookingDate: string
  ): Promise<boolean> {
    const count = await this.repository.count({
      userId,
      bookingDate,
      canceledAt: null,
    });
    return count > 0;
  }
}
