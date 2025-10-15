import { Entity } from 'electrodb';
import { client, table } from '../db/dbClient.js';

export const SeatConfigurationEntity = new Entity(
  {
    model: {
      entity: 'SeatConfiguration',
      version: '1',
      service: 'CompanyPortal',
    },
    attributes: {
      configId: { type: 'string', required: true },
      defaultSeatCount: { type: 'number' },
      modifiedBy: { type: 'string' },
      lastModified: { type: 'string' },
    },
    indexes: {
      seatConfig: {
        pk: { field: 'pk', composite: ['configId'] },
        sk: { field: 'sk', composite: [] },
      },
    },
  },
  { client, table }
);
