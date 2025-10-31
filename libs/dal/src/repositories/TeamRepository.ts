import { Team } from '../models/Team.js';
import { BaseRepository } from './BaseRepository.js';

export class TeamRepository extends BaseRepository<Team> {
  constructor() {
    super(Team);
  }

  async getAllActiveTeams(): Promise<Team[]> {
    return this.repository
      .aggregate([
        { $match: { deleted: false } },
        {
          $lookup: {
            from: 'users',
            localField: 'members',
            foreignField: 'email',
            as: 'membersDetails',
          },
        },
        {
          $project: {
            name: 1,
            ownerId: 1,
            color: 1,
            members: 1,
            membersDetails: {
              $map: {
                input: '$membersDetails',
                as: 'memberDetail',
                in: {
                  email: '$$memberDetail.email',
                  name: '$$memberDetail.name',
                },
              },
            },
          },
        },
      ])
      .toArray();
  }

  async softDeleteTeam(id: string): Promise<Team | null> {
    return this.update(id, { deleted: true });
  }
}
