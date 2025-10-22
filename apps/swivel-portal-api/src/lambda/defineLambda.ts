/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIGatewayProxyEvent } from 'aws-lambda';
import { HttpError } from '@swivel-portal/types';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

export type Middleware<TBody = any, TQuery = any, TOutput = any> = (ctx: {
  event: APIGatewayProxyEvent;
  body: TBody;
  query: TQuery;
}) => Promise<{ extra: TOutput }>;

export interface LambdaDefinitionOptions<
  TBody = any,
  TQuery = any,
  TPathParameters = any,
  TOutput = any,
  TExtras = {}
> {
  handler: ({
    body,
    query,
    pathParameters,
    extras,
  }: {
    body: TBody;
    query: TQuery;
    pathParameters: TPathParameters;
    extras: TExtras;
  }) => Promise<TOutput>;
  log: boolean;
  middlewares?: Array<Middleware>;
}

export const defineLambda = <
  TBody = never,
  TQuery = any,
  TPathParameters = any,
  TOutput = any,
  TExtras = {}
>(
  options: LambdaDefinitionOptions<
    TBody,
    TQuery,
    TPathParameters,
    TOutput,
    TExtras
  >
) => {
  return async (event: APIGatewayProxyEvent, _context: any) => {
    if (options.log) {
      console.log('Event:', JSON.stringify(event, null, 2));
    }

    const {
      body: stringifiedBody,
      queryStringParameters,
      pathParameters: rawPathParameters,
    } = event;

    const body: TBody = stringifiedBody
      ? JSON.parse(stringifiedBody)
      : ({} as TBody);
    const query: TQuery = (queryStringParameters || {}) as TQuery;
    const pathParameters: TPathParameters = (rawPathParameters ||
      {}) as TPathParameters;

    try {
      // Apply middlewares
      let extras = {} as TExtras;
      if (options.middlewares) {
        for (const middleware of options.middlewares) {
          const output = await middleware({ event, body, query });
          extras = { ...extras, ...output.extra };
        }
      }

      // Call the handler
      const result = await options.handler({
        body,
        query,
        pathParameters,
        extras,
      });

      if (options.log) {
        console.log('Result:', JSON.stringify(result, null, 2));
      }

      return {
        statusCode: 200,
        body: JSON.stringify(result),
        headers: { ...DEFAULT_HEADERS },
      };
    } catch (error) {
      let statusCode = 500;
      let message = (error as Error).message || 'Internal Server Error';

      if (error instanceof HttpError) {
        statusCode = error.statusCode;
        message = error.message;
      }

      if (options.log) {
        console.error('Error:', {
          statusCode,
          message,
          stack: (error as Error).stack,
        });
      }

      return {
        statusCode,
        body: JSON.stringify({ message }),
        headers: { ...DEFAULT_HEADERS },
      };
    }
  };
};
