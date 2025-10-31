import api from '../axios';

export type MealNotificationSettings = {
  userEmail: string;
  preferredTimeUTC?: string | null;
  addedBy?: string;
  updatedBy?: string;
  updatedAt?: string;
};

export async function listMealNotifications(): Promise<MealNotificationSettings[]> {
  const res = await api.get('/api/meal/notifications/all');
  return res.data.users ?? [];
}

export async function addMealNotification(settings: { userEmail: string; preferredTimeUTC?: string | null }) {
  await api.post('/api/meal/notifications', settings);
}

export async function deleteMealNotification(userEmail: string) {
  await api.delete('/api/meal/notifications', { data: { userEmail } });
}


