import { IMealNotificationSettingsRepository } from '@swivel-portal/types';
import { MealNotificationSettings } from '../models/MealNotificationSettings.js';
import { BaseRepository } from './BaseRepository.js';

export class MealNotificationSettingsRepository
  extends BaseRepository<MealNotificationSettings>
  implements IMealNotificationSettingsRepository<MealNotificationSettings>
{
  constructor() {
    super(MealNotificationSettings);
  }

  async getByUserId(userId: string): Promise<MealNotificationSettings | null> {
    return this.repository.findOne({ where: { userId } });
  }

  async setForUser(
    userId: string,
    settings: { receiveDailyEmail: boolean; preferredTimeUTC?: string | null }
  ): Promise<MealNotificationSettings> {
    const existing = await this.getByUserId(userId);
    if (!existing) {
      return this.repository.save({ userId, ...settings } as MealNotificationSettings);
    }
    existing.receiveDailyEmail = settings.receiveDailyEmail;
    existing.preferredTimeUTC = settings.preferredTimeUTC ?? null;
    await this.repository.save(existing);
    return existing;
  }

  async listAllEnabled(): Promise<MealNotificationSettings[]> {
    return this.repository.find({ where: { receiveDailyEmail: true } });
  }
}


