import { ObjectId } from 'mongodb';
import { RepositoryContext } from '@swivel-portal/dal';
import { Team } from '@swivel-portal/types';

export async function createTeam(input: {
  name: string;
  color: string;
  ownerId: string;
}): Promise<Team> {
  // Only name, color, ownerId are required; memberIds defaults to []
  const team = await RepositoryContext.teamRepository.create({
    name: input.name,
    color: input.color,
    ownerId: new ObjectId(input.ownerId),
    memberIds: [],
    deleted: false,
  });
  return {
    ...team,
    _id: team._id.toString(),
    ownerId: team.ownerId.toString(),
    memberIds: team.memberIds.map((id) => id.toString()),
  };
}
