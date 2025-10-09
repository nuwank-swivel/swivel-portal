import mongoose, { Document, Schema } from 'mongoose';

export interface BookingDocument extends Document {
  seatId: string;
  userId: string;
  date: Date;
  duration: string;
  lunchOption?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<BookingDocument>({
  seatId: { type: String, required: true },
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  duration: { type: String, required: true },
  lunchOption: { type: String },
}, { timestamps: true });

export const Booking = mongoose.models.Booking || mongoose.model<BookingDocument>('Booking', BookingSchema);