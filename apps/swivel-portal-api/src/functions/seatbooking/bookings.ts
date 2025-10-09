import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { connectToDb } from '@swivel-portal/dal';
import { bookSeat } from '@swivel-portal/domain';

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // Extract user from authorizer context
  const userId = event.requestContext.authorizer?.azureAdId as string;
  if (!userId) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized: missing user id' }),
    };
  }

  // Parse and validate request body
  let body: any = {};
  try {
    body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }
  const { date, duration, lunchOption, seatId } = body || {};
  if (!date || !duration || !seatId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields' }),
    };
  }

  try {
    await connectToDb();
    const booking = await bookSeat({ seatId, userId, date, duration, lunchOption });
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Booking created', booking }),
    };
  } catch (error: unknown) {
    const errMsg = (error && typeof error === 'object' && 'message' in error) ? (error as { message: string }).message : 'Booking failed';
    return {
      statusCode: 400,
      body: JSON.stringify({ error: errMsg }),
    };
  }
};