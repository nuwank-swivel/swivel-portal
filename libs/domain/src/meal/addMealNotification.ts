import { connectToDb, RepositoryContext } from '@swivel-portal/dal';

export interface AddMealNotificationBody {
  userEmail: string;
  preferredTimeUTC?: string | null;
  actor: string;
}

export async function addMealNotification(body: AddMealNotificationBody): Promise<{ ok: true }> {
  await connectToDb();
  const { userEmail, preferredTimeUTC, actor } = body;
  if (!userEmail) throw new Error('userEmail is required');
  await RepositoryContext.mealNotificationSettingsRepository.addForUser(userEmail, {
    preferredTimeUTC: preferredTimeUTC ?? null,
    addedBy: actor,
    updatedBy: actor,
  });
  return { ok: true };
}