import { Team } from '@swivel-portal/types';
import { RepositoryContext } from '@swivel-portal/dal';

export async function listTeams(): Promise<Team[]> {
  return (await RepositoryContext.teamRepository.getAllActiveTeams()).map(
    (team) => ({
      ...team,
      _id: team._id.toString(),
    })
  );
}
