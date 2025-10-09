import { IRepository, User } from '@swivel-portal/types';
import { User as UserModal } from '../models/User.js';

export class UserRepository implements IRepository<User> {
  async getById(id: string): Promise<User | null> {
    try {
      const user = await UserModal.findOne({ azureAdId: id }).exec();
      if (!user) {
        return null;
      }
      return user.toObject() as User;
    } catch (error) {
      console.log('Error fetching user by ID:', error);
      return null;
    }
  }
  async create(item: User): Promise<User> {
    const newUser = new UserModal(item);
    await newUser.save();
    return newUser.toObject() as User;
  }
  update(id: string, item: Partial<User>): Promise<User | null> {
    throw new Error('Method not implemented.');
  }
  delete(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
