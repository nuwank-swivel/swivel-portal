import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { connectToDb } from '@swivel-portal/dal';
import { bookSeat } from '@swivel-portal/domain';

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  };

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: corsHeaders,
    };
  }

  // Extract user from authorizer context
  const userId = event.requestContext.authorizer?.azureAdId as string;
  if (!userId) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized: missing user id' }),
      headers: corsHeaders,
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
      headers: corsHeaders,
    };
  }
  const { date, duration, lunchOption } = body || {};
  if (!date || !duration) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields' }),
      headers: corsHeaders,
    };
  }

  try {
    await connectToDb();
    const booking = await bookSeat({ userId, date, duration, lunchOption });
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Booking created', booking }),
      headers: corsHeaders,
    };
  } catch (error: unknown) {
    const errMsg =
      error && typeof error === 'object' && 'message' in error
        ? (error as { message: string }).message
        : 'Booking failed';
    return {
      statusCode: 400,
      body: JSON.stringify({ error: errMsg }),
      headers: corsHeaders,
    };
  }
};
