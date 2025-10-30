import { connectToDb } from '@swivel-portal/dal';
import type {
  PresenceEventRecord,
  PresenceEventType,
} from '@swivel-portal/types';
import { RepositoryContext } from '@swivel-portal/dal';

export async function getPresenceEventsByUser(
  userId: string
): Promise<PresenceEventRecord[]> {
  await connectToDb();
  const results = await RepositoryContext.presenceEventRepository.findByUser(
    userId
  );
  return results.map((e) => ({
    ...e,
    _id: e._id?.toString(),
    event: e.event as PresenceEventType,
  }));
}

export async function getPresenceEventsByDate(
  date: string
): Promise<PresenceEventRecord[]> {
  await connectToDb();
  const results = await RepositoryContext.presenceEventRepository.findByDate(
    date
  );
  return results.map((e) => ({
    ...e,
    _id: e._id?.toString(),
    event: e.event as PresenceEventType,
  }));
}

export async function getPresenceEventsByUserAndDate(
  userId: string,
  date: string
): Promise<PresenceEventRecord[]> {
  await connectToDb();
  const results =
    await RepositoryContext.presenceEventRepository.findByUserAndDate(
      userId,
      date
    );
  return results.map((e) => ({
    ...e,
    _id: e._id?.toString(),
    event: e.event as PresenceEventType,
  }));
}

// Given a user's azureAdId, find their team and return team presence for a date
export async function getTeamPresenceForUser(
  azureAdId: string,
  date: string
): Promise<PresenceEventRecord[]> {
  await connectToDb();
  const user = await RepositoryContext.userRepository.getByAzureAdId(azureAdId);
  if (!user || !user.teamId) throw new Error('User or team not found');
  const results =
    await RepositoryContext.presenceEventRepository.findByTeamAndDate(
      user.teamId,
      date
    );
  return results.map((e) => ({
    ...e,
    _id: e._id?.toString(),
    event: e.event as PresenceEventType,
  }));
}
