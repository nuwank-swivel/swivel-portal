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
    settings: {
      receiveDailyEmail: boolean;
      preferredTimeUTC?: string | null;
      addedBy?: string;
      updatedBy?: string;
    }
  ): Promise<MealNotificationSettings> {
    const existing = await this.getByUserId(userId);
    if (!existing) {
      // On create, always set both addedBy and updatedBy, and log the object
      const addedBy = settings.addedBy || 'system';
      const updatedBy = settings.updatedBy || settings.addedBy || 'system';
      const toSave: Partial<MealNotificationSettings> = {
        userId,
        receiveDailyEmail: settings.receiveDailyEmail,
        preferredTimeUTC: settings.preferredTimeUTC ?? null,
        addedBy,
        updatedBy,
      };
      console.log('[MealNotificationSettingsRepository] Saving new:', toSave);
      return this.repository.save(toSave as MealNotificationSettings);
    }
    existing.receiveDailyEmail = settings.receiveDailyEmail;
    existing.preferredTimeUTC = settings.preferredTimeUTC ?? null;
    existing.updatedBy = settings.updatedBy || existing.updatedBy || 'system';
    // Defensive: if addedBy is missing and provided in settings, set it
    if (!existing.addedBy && settings.addedBy) {
      existing.addedBy = settings.addedBy;
    }
    console.log('[MealNotificationSettingsRepository] Updating existing:', existing);
    await this.repository.save(existing);
    return existing;
  }

  async listAllEnabled(): Promise<MealNotificationSettings[]> {
    return this.repository.find({ where: { receiveDailyEmail: true } });
  }
}


