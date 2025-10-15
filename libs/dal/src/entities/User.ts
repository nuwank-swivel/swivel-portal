import { Entity } from 'electrodb';
import { client, table } from '../db/dbClient.js';
import { v4 as uuid } from 'uuid';

export const UserEntity = new Entity(
  {
    model: {
      entity: 'User',
      version: '1',
      service: 'CompanyPortal',
    },
    attributes: {
      userId: { type: 'string', required: true, default: () => uuid() },
      azureAdId: { type: 'string', required: true },
      email: { type: 'string', required: true },
      name: { type: 'string' },
      isAdmin: { type: 'boolean' },
    },
    indexes: {
      user: {
        pk: { field: 'pk', composite: ['userId'] },
        sk: { field: 'sk', composite: [] },
      },
      byAzureAdId: {
        index: 'gsi1pk-gsi1sk-index',
        pk: { field: 'gsi1pk', composite: ['azureAdId'] },
        sk: { field: 'gsi1sk', composite: [] },
      },
      seatBookingsOf: {
        index: 'gsi3pk-gsi3sk-index',
        collection: 'SeatBooking',
        pk: { field: 'gsi3pk', composite: ['userId'] },
        sk: { field: 'gsi3sk', composite: [] },
      },
    },
  },
  { client, table }
);
