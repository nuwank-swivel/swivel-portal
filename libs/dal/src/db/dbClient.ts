import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const dynamoDb = new DynamoDBClient();
export const client = DynamoDBDocumentClient.from(dynamoDb);

export const table = 'swivel-portal-table';
