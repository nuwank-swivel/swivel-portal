import { Entity } from 'electrodb';
import { client, table } from '../db/dbClient.js';

export const DaySeatOverrideEntity = new Entity(
  {
    model: {
      entity: 'DaySeatOverride',
      version: '1',
      service: 'CompanyPortal',
    },
    attributes: {
      date: { type: 'string', required: true }, // ISO date
      seatCount: { type: 'number' },
      createdBy: { type: 'string' },
      createdAt: { type: 'string' },
    },
    indexes: {
      overridesByDate: {
        pk: { field: 'pk', composite: ['date'] },
        sk: { field: 'sk', composite: [] },
      },
    },
  },
  { client, table }
);
