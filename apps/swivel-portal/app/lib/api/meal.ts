
import api from '../axios';

export type MealNotificationSettings = {
  userEmail: string;
  preferredTimeUTC?: string | null;
  addedBy?: string;
  updatedBy?: string;
  updatedAt?: string;
};

export async function getMealNotifications(userEmail?: string): Promise<MealNotificationSettings | null> {
  const res = await api.get('/api/meal/notifications', { params: { userEmail } });
  return (res.data.settings ?? null) as MealNotificationSettings | null;
}

export async function addMealNotification(settings: { userEmail: string; preferredTimeUTC?: string | null }) {
  await api.post('/api/meal/notifications', settings);
}

export async function deleteMealNotification(userEmail: string) {
  await api.delete('/api/meal/notifications', { data: { userEmail } });
}


