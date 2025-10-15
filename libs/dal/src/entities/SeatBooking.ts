import { Entity } from 'electrodb';
import { client, table } from '../db/dbClient.js';
import { v4 as uuid } from 'uuid';

export const SeatBookingEntity = new Entity(
  {
    model: {
      entity: 'SeatBooking',
      version: '1',
      service: 'CompanyPortal',
    },
    attributes: {
      bookingId: { type: 'string', required: true, default: () => uuid() },
      userId: { type: 'string', required: true },
      bookingDate: { type: 'string', required: true }, // ISODate
      startTime: { type: 'string' },
      endTime: { type: 'string' },
      lunchOption: { type: 'string' },
      createdAt: { type: 'string' },
    },
    indexes: {
      seatBooking: {
        pk: { field: 'pk', composite: ['bookingId'] },
        sk: { field: 'sk', composite: [] },
      },
      // Get bookings by user
      byUser: {
        index: 'gsi3pk-gsi3sk-index',
        collection: 'SeatBooking',
        pk: { field: 'gsi3pk', composite: ['userId'] },
        sk: { field: 'gsi3sk', composite: ['bookingId'] },
      },
      // Get bookings by date
      byDate: {
        index: 'gsi2pk-gsi2sk-index',
        pk: { field: 'gsi2pk', composite: ['bookingDate'] },
        sk: { field: 'gsi2sk', composite: ['bookingId', 'userId'] },
      },
    },
  },
  { client, table }
);
