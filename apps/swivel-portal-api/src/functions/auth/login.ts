import { Context, APIGatewayProxyEvent } from 'aws-lambda';
import { loginUser } from '@swivel-portal/domain';
import { connectToDb } from '@swivel-portal/dal';

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
) => {
  console.log('Event:', JSON.stringify(event));
  await connectToDb();
  const azureAdId = event.requestContext.authorizer?.azureAdId as string;

  if (!azureAdId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing azureAdId' }),
    };
  }
  const name = event.requestContext.authorizer?.name as string;
  const email = event.requestContext.authorizer?.email as string;
  return await loginUser(azureAdId, name, email);
};
