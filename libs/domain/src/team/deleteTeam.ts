import { RepositoryContext } from '@swivel-portal/dal';
import { HttpError } from '@swivel-portal/types';
import { StatusCodes } from 'http-status-codes';

export async function deleteTeam(
  id: string,
  ownerId: string
): Promise<boolean> {
  const team = await RepositoryContext.teamRepository.getById(id);
  if (!team) {
    throw new HttpError(StatusCodes.NOT_FOUND, 'Team not found');
  }
  if (team.ownerId.toString() !== ownerId) {
    throw new HttpError(
      StatusCodes.FORBIDDEN,
      'Forbidden: Only the owner can delete the team'
    );
  }
  await RepositoryContext.teamRepository.softDeleteTeam(id);
  return true;
}
