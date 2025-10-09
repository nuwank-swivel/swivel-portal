import { UserRepository } from '@swivel-portal/dal';
import { User } from '@swivel-portal/types';

export async function loginUser(
  azureAdId: string,
  name: string,
  email: string
) {
  const userRepo = new UserRepository();
  let user = await userRepo.getById(azureAdId);
  if (!user) {
    const newUser: User = { azureAdId, name, email } as User;
    user = await userRepo.create(newUser);
  }
  return {
    statusCode: 200,
    body: JSON.stringify({
      user,
    }),
  };
}
