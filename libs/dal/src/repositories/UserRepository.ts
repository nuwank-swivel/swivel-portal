import { IUserRepository } from '@swivel-portal/types';
import { User } from '../models/User.js';
import { BaseRepository } from './BaseRepository.js';

export class UserRepository
  extends BaseRepository<User>
  implements IUserRepository<User>
{
  constructor() {
    super(User);
  }

  async setTeamForUsers(emails: string[], teamId: string): Promise<void> {
    // Bulk update users by email
    await this.repository.updateMany(
      { email: { $in: emails } },
      { $set: { teamId } }
    );
  }

  async getByAzureAdId(azureAdId: string): Promise<User | null> {
    return this.repository.findOne({ where: { azureAdId } });
  }

  async getByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }
}
