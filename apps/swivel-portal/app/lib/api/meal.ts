import api from '../axios';

// Meal options API removed per scope adjustment (criteria 1 implementation dropped)

export type MealNotificationSettings = {
  receiveDailyEmail: boolean;
  preferredTimeUTC?: string | null;
};

export async function getMealNotifications(userId?: string): Promise<MealNotificationSettings | null> {
  const res = await api.get('/api/meal/notifications', { params: { userId } });
  return (res.data.settings ?? null) as MealNotificationSettings | null;
}

export async function putMealNotifications(settings: MealNotificationSettings & { userId?: string }) {
  await api.put('/api/meal/notifications', settings);
}


