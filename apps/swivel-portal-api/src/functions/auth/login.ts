import { Context, APIGatewayProxyEvent } from 'aws-lambda';
import { loginUser } from '@swivel-portal/domain';

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
) => {
  // Function code
  return loginUser();
};
