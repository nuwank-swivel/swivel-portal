import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { loginUser } from '@swivel-portal/domain';
import { connectToDb } from '@swivel-portal/dal';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
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
  const isAdmin =
    event.requestContext.authorizer?.isAdmin === true ||
    event.requestContext.authorizer?.isAdmin === 'true';
  const user = await loginUser(azureAdId, name, email, isAdmin);

  return {
    statusCode: 200,
    body: JSON.stringify(user),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // Allow from all origins
      'Access-Control-Allow-Credentials': true, // Allow cookies and credentials
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS', // Allowed methods
      'Access-Control-Allow-Headers': 'Content-Type,Authorization', // Allowed headers
    },
  };
};
