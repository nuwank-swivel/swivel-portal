import mongoose, { Schema, Document } from 'mongoose';

interface IDaySeatOverride extends Document {
  date: string;
  seatCount: number;
  createdAt: Date;
  createdBy?: string;
}

const DaySeatOverrideSchema: Schema = new Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    seatCount: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const DaySeatOverride = mongoose.model<IDaySeatOverride>(
  'DaySeatOverride',
  DaySeatOverrideSchema
);

