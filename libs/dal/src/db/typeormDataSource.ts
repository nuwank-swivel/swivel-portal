import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../models/User.js';
import { Booking } from '../models/Booking.js';
import { DaySeatOverride } from '../models/DaySeatOverride.js';
import { SeatConfiguration } from '../models/SeatConfiguration.js';

export const AppDataSource = new DataSource({
  type: 'mongodb',
  url: process.env.DB_URL || '',
  entities: [User, Booking, DaySeatOverride, SeatConfiguration],
  synchronize: true, // Set to false in production
  logging: false,
});

export const connectToDb = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log('TypeORM MongoDB DataSource initialized');
  }
  return AppDataSource;
};
