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

  async getByUserEmail(userEmail: string): Promise<MealNotificationSettings | null> {
    return this.repository.findOne({ where: { userEmail } });
  }

  async addForUser(
    userEmail: string,
    settings: {
      preferredTimeUTC?: string | null;
      addedBy?: string;
      updatedBy?: string;
    }
  ): Promise<MealNotificationSettings> {
    const existing = await this.getByUserEmail(userEmail);
    if (existing) {
      // Already exists, update preferredTimeUTC if provided
      if (settings.preferredTimeUTC !== undefined) {
        existing.preferredTimeUTC = settings.preferredTimeUTC;
      }
      existing.updatedBy = settings.updatedBy || existing.updatedBy || 'system';
      await this.repository.save(existing);
      return existing;
    }
    const addedBy = settings.addedBy || 'system';
    const updatedBy = settings.updatedBy || settings.addedBy || 'system';
    const toSave: Partial<MealNotificationSettings> = {
      userEmail,
      preferredTimeUTC: settings.preferredTimeUTC ?? null,
      addedBy,
      updatedBy,
    };
    console.log('[MealNotificationSettingsRepository] Adding new:', toSave);
    return this.repository.save(toSave as MealNotificationSettings);
  }

  async deleteForUser(userEmail: string): Promise<void> {
    const existing = await this.getByUserEmail(userEmail);
    if (existing) {
      await this.repository.remove(existing);
      console.log('[MealNotificationSettingsRepository] Deleted for:', userEmail);
    }
  }

  async listAllEnabled(): Promise<MealNotificationSettings[]> {
    // All records are enabled
    return this.repository.find();
  }
}


