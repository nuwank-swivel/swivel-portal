import { UserRepository } from '@swivel-portal/dal';

export function loginUser() {
  // code
  const userRepo = new UserRepository();
  const user = userRepo.getById('user-id');
}
