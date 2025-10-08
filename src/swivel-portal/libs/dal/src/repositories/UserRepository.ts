import { IRepository, User } from '@swivel-portal/types';

export class UserRepository implements IRepository<User> {
  getById(id: string): Promise<User | null> {
    throw new Error('Method not implemented.');
  }
  create(item: User): Promise<User> {
    throw new Error('Method not implemented.');
  }
  update(id: string, item: Partial<User>): Promise<User | null> {
    throw new Error('Method not implemented.');
  }
  delete(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
