import { Team } from '@swivel-portal/types';
import { RepositoryContext } from '@swivel-portal/dal';
import { ObjectId } from 'mongodb';

export interface UpdateTeamInput {
  _id: string;
  name?: string;
  color?: string;
  memberIds?: string[];
}

export async function updateTeam(input: UpdateTeamInput): Promise<Team | null> {
  const updatedTeam = await RepositoryContext.teamRepository.update(input._id, {
    ...input,
    memberIds: input.memberIds?.map((id) => new ObjectId(id)),
  });
  if (!updatedTeam) return null;
  return {
    ...updatedTeam,
    _id: updatedTeam._id.toString(),
    ownerId: updatedTeam.ownerId.toString(),
    memberIds: updatedTeam.memberIds?.map((id) => id.toString()),
  };
}
