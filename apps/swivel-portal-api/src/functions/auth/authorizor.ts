interface JWTClaims {
  sub: string;
  name?: string;
  preferred_username?: string;
  roles?: string[];
  [key: string]: unknown;
}
import {
  APIGatewayAuthorizerResult,
  APIGatewayRequestAuthorizerEvent,
} from 'aws-lambda';
import jwt from 'jsonwebtoken';

const ADMIN_GROUP_ID = process.env.ADMIN_GROUP_ID;

// Replace with your Microsoft Entra ID (Azure AD) public key or JWKS logic
// const MICROSOFT_PUBLIC_KEY = process.env.MS_ENTRA_PUBLIC_KEY || '';

export const handler = async (
  event: APIGatewayRequestAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  console.log('event:', JSON.stringify(event));
  const token = event.headers ? event.headers['Authorization'] : undefined;

  if (!token) {
    console.log('No token provided');
    throw 'Unauthorized';
  }

  let decoded: JWTClaims;
  try {
    decoded = jwt.decode(token) as JWTClaims;
  } catch (err) {
    console.log('Token verification failed', err);
    throw 'Unauthorized';
  }

  // Extract Azure AD Object ID (sub or oid claim)
  const azureAdId = decoded.sub;
  if (!azureAdId) {
    throw 'Unauthorized';
  }

  const name = decoded.name;
  const email = decoded.preferred_username;
  const roles: string[] = decoded.roles || [];

  // Check if user is admin
  let isAdmin = false;
  if (ADMIN_GROUP_ID && Array.isArray(roles)) {
    isAdmin = roles.includes(ADMIN_GROUP_ID);
  }

  const context = {
    azureAdId,
    name,
    email,
    isAdmin,
  };

  // Attach azureAdId to context (context is not directly modifiable, so return in context field)
  const policy = generatePolicy(azureAdId, 'Allow', event.methodArn, context);
  console.log('Generated policy:', JSON.stringify(policy));
  return policy;
};

function generatePolicy(
  principalId: string,
  effect: 'Allow' | 'Deny',
  resource: string,
  context: object
): APIGatewayAuthorizerResult {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
    context: {
      ...context,
    },
  };
}
