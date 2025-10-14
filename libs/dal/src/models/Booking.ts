import mongoose, { Schema, Document } from 'mongoose';

interface IBooking extends Document {
  userId: string;
  bookingDate: string; // YYYY-MM-DD format
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
