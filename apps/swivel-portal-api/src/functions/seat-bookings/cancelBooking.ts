import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { connectToDb } from '@swivel-portal/dal';
import { cancelBooking } from '@swivel-portal/domain';

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

  if (event.httpMethod !== 'DELETE') {
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

  // Extract booking id from pathParameters
  const bookingId = event.pathParameters?.id;
  if (!bookingId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing booking id' }),
      headers: corsHeaders,
    };
  }

  try {
    await connectToDb();
    await cancelBooking(bookingId, userId);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Booking canceled' }),
      headers: corsHeaders,
    };
  } catch (error) {
    const errMsg = (error && typeof error === 'object' && 'message' in error) ? (error as { message: string }).message : 'Failed to cancel booking';
    return {
      statusCode: 400,
      body: JSON.stringify({ error: errMsg }),
      headers: corsHeaders,
    };
  }
};