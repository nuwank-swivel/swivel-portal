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
    // Get day of week string for the provided date
    const jsDayOfWeek = new Date(date).getDay();
    const dayOfWeekStr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][jsDayOfWeek];

    // Find bookings for the date (non-recurring)
    const regularBookings = await this.repository.aggregate([
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
          userName: { $ifNull: ['$user.name', ''] },
          durationType: 1,
          lunchOption: 1,
          seatId: 1,
          recurring: 1,
          bookingDate: 1,
        },
      },
    ]).toArray();

    // Find recurring bookings that apply to this date
    const recurringBookings = await this.repository.aggregate([
      { $match: { recurring: { $exists: true }, canceledAt: null } },
      {
        $addFields: {
          recurringStart: { $toDate: '$recurring.startDate' },
          recurringEnd: {
            $cond: [
              { $ifNull: ['$recurring.endDate', false] },
              { $toDate: '$recurring.endDate' },
              null,
            ],
          },
        },
      },
      {
        $match: {
          $expr: {
            $and: [
              { $lte: ['$recurringStart', new Date(date)] },
              {
                $or: [
                  { $eq: ['$recurringEnd', null] },
                  { $gte: ['$recurringEnd', new Date(date)] },
                ],
              },
              {
                $in: [dayOfWeekStr, '$recurring.daysOfWeek'],
              },
            ],
          },
        },
      },
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
          userName: { $ifNull: ['$user.name', ''] },
          durationType: 1,
          lunchOption: 1,
          seatId: 1,
          recurring: 1,
          bookingDate: 1,
        },
      },
    ]).toArray();

    // Combine and deduplicate by seatId and userId
    const combined = [...regularBookings, ...recurringBookings];
    const seen = new Set<string>();
    const unique = combined.filter(b => {
      const key = `${b.seatId}-${b.userId}`;
      return seen.has(key) ? false : (seen.add(key), true);
    });

    return unique;
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
