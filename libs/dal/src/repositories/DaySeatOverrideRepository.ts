import { IDaySeatOverrideRepository } from '@swivel-portal/types';
import { DaySeatOverride } from '../models/DaySeatOverride.js';
import { BaseRepository } from './BaseRepository.js';

export class DaySeatOverrideRepository
  extends BaseRepository<DaySeatOverride>
  implements IDaySeatOverrideRepository<DaySeatOverride>
{
  constructor() {
    super(DaySeatOverride);
  }

  async getByDate(date: string): Promise<DaySeatOverride | null> {
    return this.repository.findOne({ where: { date } });
  }
}
