import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { getSeatAvailability } from '@swivel-portal/domain';
import { connectToDb } from '@swivel-portal/dal';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event));
  
  try {
    await connectToDb();
    
    // Extract date from query string parameters
    const date = event.queryStringParameters?.date as string;

    // Call domain function
    const result = await getSeatAvailability(date);

    return {
      statusCode: result.statusCode,
      body: result.body,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow from all origins
        'Access-Control-Allow-Credentials': true, // Allow cookies and credentials
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS', // Allowed methods
        'Access-Control-Allow-Headers': 'Content-Type,Authorization', // Allowed headers
      },
    };
  } catch (error) {
    console.error('Error getting seat availability:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow from all origins
        'Access-Control-Allow-Credentials': true, // Allow cookies and credentials
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS', // Allowed methods
        'Access-Control-Allow-Headers': 'Content-Type,Authorization', // Allowed headers
      },
    };
  }
};

