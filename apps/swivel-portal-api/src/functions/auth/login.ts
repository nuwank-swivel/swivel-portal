import { Context, APIGatewayProxyEvent } from 'aws-lambda';

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
) => {
  // Function code
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello from Lambda!',
    }),
  };
};
