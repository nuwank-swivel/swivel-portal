import { Context, APIGatewayProxyEvent } from 'aws-lambda';
import { loginUser } from '@swivel-portal/domain';
import { connectToDb } from '@swivel-portal/dal';

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
) => {
  // Function code
  await connectToDb();
  return loginUser();
};
