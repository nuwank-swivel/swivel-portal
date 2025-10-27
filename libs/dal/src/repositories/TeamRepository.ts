import { Team } from '../models/Team.js';
import { BaseRepository } from './BaseRepository.js';

export class TeamRepository extends BaseRepository<Team> {
  constructor() {
    super(Team);
  }

  async getAllActiveTeams(): Promise<Team[]> {
    return this.repository.find({ where: { deleted: false } });
  }

  async softDeleteTeam(id: string): Promise<Team | null> {
    return this.update(id, { deleted: true });
  }
}
