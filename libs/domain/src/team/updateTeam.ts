import { Team } from '@swivel-portal/types';
import { RepositoryContext } from '@swivel-portal/dal';

export interface UpdateTeamInput {
  _id: string;
  name?: string;
  color?: string;
  members?: string[];
}

export async function updateTeam(input: UpdateTeamInput): Promise<Team | null> {
  const updatedTeam = await RepositoryContext.teamRepository.update(input._id, {
    name: input.name,
    color: input.color,
    members: input.members,
  });
  if (!updatedTeam) return null;
  // Update users to set their teamId
  if (input.members && input.members.length > 0) {
    await RepositoryContext.userRepository.setTeamForUsers(
      input.members.map((e) => e.toLowerCase()),
      input._id
    );
  }
  return {
    ...updatedTeam,
    _id: updatedTeam._id.toString(),
  };
}
