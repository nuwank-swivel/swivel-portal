import { RepositoryContext } from '@swivel-portal/dal';
import { Team } from '@swivel-portal/types';

export async function createTeam(input: {
  name: string;
  color: string;
  ownerId: string;
  members: string[]; // emails
}): Promise<Team> {
  const user = await RepositoryContext.userRepository.getByAzureAdId(
    input.ownerId
  );
  if (!user) {
    throw new Error('Owner user not found');
  }

  // add owner to members list if not already present
  if (!input.members.includes(user.email)) {
    input.members.push(user.email);
  }

  // Only name, color, ownerId are required; memberIds defaults to []
  const team = await RepositoryContext.teamRepository.create({
    name: input.name,
    color: input.color,
    ownerId: input.ownerId,
    members: input.members,
    deleted: false,
  });
  // Update users to set their teamId
  if (input.members && input.members.length > 0) {
    await RepositoryContext.userRepository.setTeamForUsers(
      [...input.members.map((e) => e.toLowerCase())],
      team._id.toString()
    );
  }
  return {
    ...team,
    _id: team._id.toString(),
  };
}
