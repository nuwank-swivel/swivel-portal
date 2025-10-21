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

  async getByAzureAdId(azureAdId: string): Promise<User | null> {
    return this.repository.findOne({ where: { azureAdId } });
  }
}
