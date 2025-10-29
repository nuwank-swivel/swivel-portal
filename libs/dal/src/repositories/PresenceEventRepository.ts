import { PresenceEvent } from '../models/PresenceEvent.js';
import { BaseRepository } from './BaseRepository.js';

export class PresenceEventRepository extends BaseRepository<PresenceEvent> {
  constructor() {
    super(PresenceEvent);
  }

  async findByUser(userId: string): Promise<PresenceEvent[]> {
    return this.repository.find({
      where: { userId },
      order: { timestamp: 'DESC' },
    });
  }

  async findByDate(date: string): Promise<PresenceEvent[]> {
    // Assumes date is YYYY-MM-DD
    const start = new Date(date + 'T00:00:00.000Z');
    const end = new Date(date + 'T23:59:59.999Z');
    return this.repository.find({
      where: {
        timestamp: { $gte: start, $lte: end },
      },
      order: { timestamp: 'DESC' },
    });
  }

  async findByUserAndDate(
    userId: string,
    date: string
  ): Promise<PresenceEvent[]> {
    const start = new Date(date + 'T00:00:00.000Z');
    const end = new Date(date + 'T23:59:59.999Z');
    return this.repository.find({
      where: {
        userId,
        timestamp: { $gte: start, $lte: end },
      },
      order: { timestamp: 'DESC' },
    });
  }

  async findAll(): Promise<PresenceEvent[]> {
    return this.repository.find();
  }
}
