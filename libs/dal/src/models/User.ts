import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  _id: string;
  azureAdId: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  isAdmin: boolean;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      // required: true,
      trim: true,
    },
    azureAdId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
