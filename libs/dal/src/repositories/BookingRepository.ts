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

  // Helper to get all recurring bookings for a user (optionally filtered by userId)
  private async getAllRecurringBookings(userId?: string) {
    const match: any = {
      recurring: { $exists: true, $ne: null },
      canceledAt: null,
    };
    if (userId) match.userId = userId;
    return this.repository
      .aggregate([
        { $match: match },
        {
          $project: {
            userId: 1,
            userName: { $ifNull: ['$user.name', ''] },
            durationType: 1,
            duration: 1,
            lunchOption: 1,
            seatId: 1,
            recurring: 1,
            bookingDate: 1,
            overrides: 1,
          },
        },
      ])
      .toArray();
  }

  // Helper to get day of week string
  private getDayOfWeekStr(date: string): string {
    const jsDayOfWeek = new Date(date).getDay();
    return [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ][jsDayOfWeek];
  }

  private processBookingInstanceOverride(
    booking: Booking,
    date: string
  ): Booking | null {
    if (Array.isArray(booking.overrides)) {
      const cancelledOverride = booking.overrides.find(
        (o) => date === o.date && o.cancelledAt !== undefined
      );
      if (cancelledOverride) {
        return null; // Mark for removal
      }

      const lunchOverrides = booking.overrides.filter(
        (o) => o.date === date && o.cancelledAt === undefined
      );
      const latestLunchOverride = lunchOverrides.pop();
      if (latestLunchOverride) {
        const { date: _, ...rest } = latestLunchOverride;
        return { ...booking, ...rest };
      }
    }
    return booking;
  }

  private processOverrides(bookings: Booking[], date: string): Booking[] {
    return bookings
      .map((b) => this.processBookingInstanceOverride(b, date))
      .filter(Boolean) as Booking[];
  }

  // Helper to get regular bookings for a date (optionally filtered by user)
  private async getRegularBookings(date: string, userId?: string) {
    const match: any = { bookingDate: date, canceledAt: null };
    if (userId) match.userId = userId;
    return this.repository
      .aggregate([
        { $match: match },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: 'azureAdId',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        // Convert user.teamId to ObjectId if needed
        {
          $addFields: {
            'user.teamId': {
              $cond: [
                {
                  $and: [
                    { $ne: ['$user.teamId', null] },
                    { $ne: [{ $type: '$user.teamId' }, 'objectId'] },
                  ],
                },
                { $toObjectId: '$user.teamId' },
                '$user.teamId',
              ],
            },
          },
        },
        {
          $lookup: {
            from: 'teams',
            localField: 'user.teamId',
            foreignField: '_id',
            as: 'team',
            pipeline: [{ $project: { name: 1, color: 1 } }],
          },
        },
        { $unwind: { path: '$team', preserveNullAndEmptyArrays: true } },
      ])
      .toArray();
  }

  // Helper to get recurring bookings for a date (optionally filtered by user)
  private async getRecurringBookings(
    date: string,
    dayOfWeekStr: string,
    userId?: string
  ) {
    const match: any = {
      recurring: { $exists: true, $ne: null },
      canceledAt: null,
    };
    if (userId) match.userId = userId;
    return this.repository
      .aggregate([
        { $match: match },
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
        // Convert user.teamId to ObjectId if needed
        {
          $addFields: {
            'user.teamId': {
              $cond: [
                {
                  $and: [
                    { $ne: ['$user.teamId', null] },
                    { $ne: [{ $type: '$user.teamId' }, 'objectId'] },
                  ],
                },
                { $toObjectId: '$user.teamId' },
                '$user.teamId',
              ],
            },
          },
        },
        {
          $lookup: {
            from: 'teams',
            localField: 'user.teamId',
            foreignField: '_id',
            as: 'team',
            pipeline: [{ $project: { name: 1, color: 1 } }],
          },
        },
        { $unwind: { path: '$team', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            userId: 1,
            userName: { $ifNull: ['$user.name', ''] },
            durationType: 1,
            lunchOption: 1,
            seatId: 1,
            recurring: 1,
            bookingDate: 1,
            team: 1,
            user: 1,
            overrides: 1,
          },
        },
      ])
      .toArray();
  }

  // Helper to deduplicate bookings by seatId and userId
  private dedupeBookings(bookings: any[]): any[] {
    const seen = new Set<string>();
    return bookings.filter((b) => {
      const key = `${b.seatId}-${b.userId}-${b.bookingDate}`;
      return seen.has(key) ? false : (seen.add(key), true);
    });
  }

  async findAllBookingsByDate(date: string): Promise<Array<Booking>> {
    const dayOfWeekStr = this.getDayOfWeekStr(date);
    const regularBookings = await this.getRegularBookings(date);
    let recurringBookings = await this.getRecurringBookings(date, dayOfWeekStr);

    // there could be original bookingDate in recurring bookings, override it
    recurringBookings = recurringBookings.map((b) => ({
      ...b,
      bookingDate: date,
    }));

    // Merge overrides for matching date and filter out cancelled overrides
    const allBookings = [...regularBookings, ...recurringBookings] as Booking[];
    const processedBookings = this.processOverrides(allBookings, date);
    return this.dedupeBookings(processedBookings);
  }

  async findUserUpcomingBookings(
    userId: string,
    fromDate: string
  ): Promise<Booking[]> {
    // Get regular upcoming bookings efficiently
    const regularBookings = await this.repository.find({
      where: {
        userId,
        bookingDate: { $gte: fromDate },
        canceledAt: null,
      },
      order: { bookingDate: 'ASC' },
    });

    // Get all recurring bookings for the user once
    const allRecurring = await this.getAllRecurringBookings(userId);
    const recurringInstances: Booking[] = [];

    for (const b of allRecurring) {
      const start = new Date(b.recurring.startDate);
      const end = b.recurring.endDate
        ? new Date(b.recurring.endDate)
        : undefined;

      if (Array.isArray(b.recurring.daysOfWeek)) {
        for (const dayName of b.recurring.daysOfWeek) {
          let count = 0;

          // Start from the next occurrence of that weekday
          const current = new Date(fromDate);

          // Move forward until we hit the right day of the week
          while (
            this.getDayOfWeekStr(current.toISOString().slice(0, 10)) !== dayName
          ) {
            current.setDate(current.getDate() + 1);
          }

          // Now generate next 10 dates for that weekday
          while (count < 10) {
            if (current >= start && (!end || current <= end)) {
              // Spread override fields if present for this date
              const instance: Booking = {
                ...b,
                bookingDate: current.toISOString().slice(0, 10),
              };
              const processedInstance = this.processBookingInstanceOverride(
                instance,
                instance.bookingDate
              );
              if (processedInstance) {
                recurringInstances.push(processedInstance);
                count++;
              }
            }
            // Jump ahead 7 days for the next occurrence
            current.setDate(current.getDate() + 7);
          }
        }
      }
    }

    // Combine, deduplicate, sort, and return first 10
    const results: Booking[] = [...regularBookings, ...recurringInstances];
    const unique = this.dedupeBookings(results);

    unique.sort(
      (a, b) =>
        new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime()
    );

    return unique.slice(0, 10);
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
    const bookings = await this.findUserUpcomingBookings(userId, bookingDate);
    return bookings.length > 0;
  }
}
