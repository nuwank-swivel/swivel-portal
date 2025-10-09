export function loginUser() {
  // code
  // const userRepo = new UserRepository();
  // const user = userRepo.getById('user-id');
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello from Lambda!',
    }),
  };
}
