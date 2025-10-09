import mongoose, { Schema, Document } from 'mongoose';

interface ISeatConfiguration extends Document {
  defaultSeatCount: number;
  lastModified: Date;
  modifiedBy?: string;
}

const SeatConfigurationSchema: Schema = new Schema(
  {
    defaultSeatCount: {
      type: Number,
      required: true,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
    modifiedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const SeatConfiguration = mongoose.model<ISeatConfiguration>(
  'SeatConfiguration',
  SeatConfigurationSchema
);

