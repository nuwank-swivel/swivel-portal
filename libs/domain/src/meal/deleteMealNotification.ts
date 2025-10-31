import { connectToDb, RepositoryContext } from '@swivel-portal/dal';

export interface DeleteMealNotificationBody {
  userEmail: string;
  actor: string;
}

export async function deleteMealNotification(body: DeleteMealNotificationBody): Promise<{ ok: true }> {
  await connectToDb();
  const { userEmail } = body;
  if (!userEmail) throw new Error('userEmail is required');
  await RepositoryContext.mealNotificationSettingsRepository.deleteForUser(userEmail);
  return { ok: true };
}