import { connectToDb, RepositoryContext } from '@swivel-portal/dal';

export interface MealNotificationSettingsResult {
  userEmail: string;
  preferredTimeUTC?: string | null;
  addedBy?: string;
  updatedBy?: string;
  updatedAt?: Date;
}

export async function getMealNotifications(userEmail: string): Promise<MealNotificationSettingsResult | null> {
  await connectToDb();
  const settings = await RepositoryContext.mealNotificationSettingsRepository.getByUserEmail(userEmail);
  if (!settings) return null;
  return {
    userEmail: settings.userEmail,
    preferredTimeUTC: settings.preferredTimeUTC,
    addedBy: settings.addedBy,
    updatedBy: settings.updatedBy,
    updatedAt: settings.updatedAt,
  };
}