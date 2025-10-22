import { RepositoryContext } from '@swivel-portal/dal';
import { Team } from '@swivel-portal/types';

export async function createTeam(input: {
  name: string;
  color: string;
  ownerId: string;
}): Promise<Team> {
  const user = await RepositoryContext.userRepository.getByAzureAdId(
    input.ownerId
  );
  if (!user) {
    throw new Error('Owner user not found');
  }
  // Only name, color, ownerId are required; memberIds defaults to []
  const team = await RepositoryContext.teamRepository.create({
    name: input.name,
    color: input.color,
    ownerId: input.ownerId,
    memberIds: [],
    deleted: false,
  });
  return {
    ...team,
    _id: team._id.toString(),
  };
}
