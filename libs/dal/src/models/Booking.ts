import mongoose, { Schema, Document } from 'mongoose';

interface IBooking extends Document {
  seatId?: string; // Optional for now, added by create-booking feature
  userId: string;
  bookingDate: string; // YYYY-MM-DD format for availability feature
  date?: Date; // For create-booking feature compatibility
  startTime?: string;
  endTime?: string;
  durationType: 'hour' | 'half-day' | 'full-day';
  duration?: string; // Alias for durationType (create-booking compatibility)
  lunchOption?: string;
  createdAt: Date;
  updatedAt?: Date;
  canceledAt?: Date | null;
  canceledBy?: string | null;
}

const BookingSchema: Schema = new Schema(
  {
    seatId: {
      type: String,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    bookingDate: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: Date,
    },
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    },
    durationType: {
      type: String,
      required: true,
      enum: ['hour', 'half-day', 'full-day'],
    },
    duration: {
      type: String,
    },
    lunchOption: {
      type: String,
    },
    canceledAt: {
      type: Date,
      default: null,
    },
    canceledBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
BookingSchema.index({ bookingDate: 1, userId: 1 });

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
