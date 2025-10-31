import { connectToDb, RepositoryContext } from '@swivel-portal/dal';

export interface MealNotificationSettingsResult {
  userEmail: string;
  preferredTimeUTC?: string | null;
  addedBy?: string;
  updatedBy?: string;
  updatedAt?: Date;
}

export async function listMealNotifications(): Promise<MealNotificationSettingsResult[]> {
  await connectToDb();
  const settings = await RepositoryContext.mealNotificationSettingsRepository.listAllEnabled();
  return settings.map((s) => ({
    userEmail: s.userEmail,
    preferredTimeUTC: s.preferredTimeUTC,
    addedBy: s.addedBy,
    updatedBy: s.updatedBy,
    updatedAt: s.updatedAt,
  }));
}