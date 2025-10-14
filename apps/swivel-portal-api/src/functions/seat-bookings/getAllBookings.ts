import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { connectToDb } from '@swivel-portal/dal';
import { getAllBookingsForDate } from '@swivel-portal/domain';

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

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: corsHeaders,
    };
  }

  // Extract user from authorizer context
  const isAdmin = event.requestContext.authorizer?.isAdmin;
  if (!isAdmin) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Forbidden: admin access required' }),
      headers: corsHeaders,
    };
  }

  // Get date from query string
  const date = event.queryStringParameters?.date;
  if (!date) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing date parameter' }),
      headers: corsHeaders,
    };
  }

  try {
    await connectToDb();
    const bookings = await getAllBookingsForDate(date);
    return {
      statusCode: 200,
      body: JSON.stringify({ bookings }),
      headers: corsHeaders,
    };
  } catch (error) {
    const errMsg =
      error && typeof error === 'object' && 'message' in error
        ? (error as { message: string }).message
        : 'Failed to fetch bookings';
    return {
      statusCode: 400,
      body: JSON.stringify({ error: errMsg }),
      headers: corsHeaders,
    };
  }
};
