import { RepositoryContext } from '@swivel-portal/dal';
import { User } from '@swivel-portal/types';

export async function loginUser(
  azureAdId: string,
  name: string,
  email: string,
  isAdmin: boolean
): Promise<User> {
  let user = await RepositoryContext.userRepository.getByAzureAdId(azureAdId);
  if (!user) {
    const newUser: User = {
      azureAdId,
      name,
      email: email.toLowerCase(),
      isAdmin,
      teamId: undefined,
    };
    user = await RepositoryContext.userRepository.create(newUser);
  } else {
    // Update isAdmin if changed
    if (user.isAdmin !== isAdmin) {
      user.isAdmin = isAdmin;
      // Optionally persist this change if needed
      // await userRepo.update(azureAdId, { isAdmin });
    }
  }
  return { ...user, _id: user._id.toString() };
}
