import { Booking, BookingDocument } from '../models/Booking'; // .js extension will be resolved by build tools or can be added if needed

export class BookingRepository {
  static async createBooking(data: Partial<BookingDocument>) {
    return Booking.create(data);
  }

  static async findBookingsByDateAndSeat(seatId: string, date: Date) {
    return Booking.find({ seatId, date });
  }

  static async isSeatAvailable(seatId: string, date: Date) {
    const count = await Booking.countDocuments({ seatId, date });
    return count === 0;
  }
}