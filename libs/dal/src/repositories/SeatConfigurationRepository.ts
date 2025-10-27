import { ISeatConfigurationRepository } from '@swivel-portal/types';
import { SeatConfiguration } from '../models/SeatConfiguration.js';
import { BaseRepository } from './BaseRepository.js';

export class SeatConfigurationRepository
  extends BaseRepository<SeatConfiguration>
  implements ISeatConfigurationRepository<SeatConfiguration>
{
  constructor() {
    super(SeatConfiguration);
  }

  async getDefaultConfig(): Promise<SeatConfiguration | null> {
    return this.repository.findOne({});
  }
}
