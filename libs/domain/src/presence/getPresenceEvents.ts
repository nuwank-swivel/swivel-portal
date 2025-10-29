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
