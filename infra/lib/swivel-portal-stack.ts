import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

import * as path from 'path';

export class SwivelPortalStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda Layer from infra/layers/layer.zip
    const sharedLayer = new lambda.LayerVersion(
      this,
      'SwivelPortalSharedLayer',
      {
        code: lambda.Code.fromAsset(
          path.join(__dirname, '../layers/layer.zip')
        ),
        compatibleRuntimes: [lambda.Runtime.NODEJS_22_X],
        description: 'Shared layer for Swivel Portal Lambdas',
      }
    );

    // Lambda function for /auth/login
    const loginLambda = new lambda.Function(this, 'AuthLoginLambda', {
      code: lambda.Code.fromAsset(
        path.join(
          __dirname,
          '../../apps/swivel-portal-api/dist/auth/login.js.zip'
        )
      ),
      handler: 'login.handler',
      runtime: lambda.Runtime.NODEJS_22_X,
      environment: {
        DB_USERNAME: process.env.DB_USERNAME || '',
        DB_PASSWORD: process.env.DB_PASSWORD || '',
        ADMIN_GROUP_ID: process.env.ADMIN_GROUP_ID || '',
      },
      layers: [sharedLayer],
      timeout: cdk.Duration.seconds(10),
    });

    // Lambda function for custom authorizer
    const authorizerLambda = new lambda.Function(this, 'ApiAuthorizerLambda', {
      code: lambda.Code.fromAsset(
        path.join(
          __dirname,
          '../../apps/swivel-portal-api/dist/auth/authorizor.js.zip'
        )
      ),
      handler: 'authorizor.handler',
      runtime: lambda.Runtime.NODEJS_22_X,
      environment: {
        MS_ENTRA_PUBLIC_KEY: process.env.MS_ENTRA_PUBLIC_KEY || '',
        ADMIN_GROUP_ID: process.env.ADMIN_GROUP_ID || '',
      },
    });

    // Lambda function for seat availability
    const seatAvailabilityLambda = new lambda.Function(
      this,
      'SeatAvailabilityLambda',
      {
        code: lambda.Code.fromAsset(
          path.join(
            __dirname,
            '../../apps/swivel-portal-api/dist/availability/getAvailability.js.zip'
          )
        ),
        handler: 'getAvailability.handler',
        runtime: lambda.Runtime.NODEJS_22_X,
        environment: {
          DB_USERNAME: process.env.DB_USERNAME || '',
          DB_PASSWORD: process.env.DB_PASSWORD || '',
        },
        layers: [sharedLayer],
        timeout: cdk.Duration.seconds(10),
      }
    );

    // Lambda function for creating bookings
    const createBookingLambda = new lambda.Function(
      this,
      'CreateBookingLambda',
      {
        code: lambda.Code.fromAsset(
          path.join(
            __dirname,
            '../../apps/swivel-portal-api/dist/seat-bookings/seatBookings.js.zip'
          )
        ),
        handler: 'seatBookings.handler',
        runtime: lambda.Runtime.NODEJS_22_X,
        environment: {
          DB_USERNAME: process.env.DB_USERNAME || '',
          DB_PASSWORD: process.env.DB_PASSWORD || '',
        },
        layers: [sharedLayer],
        timeout: cdk.Duration.seconds(10),
      }
    );

    // Lambda function for GET /api/seatbooking/bookings/me
    const getMyBookingsLambda = new lambda.Function(
      this,
      'GetMyBookingsLambda',
      {
        code: lambda.Code.fromAsset(
          path.join(
            __dirname,
            '../../apps/swivel-portal-api/dist/seat-bookings/getMyBookings.js.zip'
          )
        ),
        handler: 'getMyBookings.handler',
        runtime: lambda.Runtime.NODEJS_22_X,
        environment: {
          DB_USERNAME: process.env.DB_USERNAME || '',
          DB_PASSWORD: process.env.DB_PASSWORD || '',
        },
        layers: [sharedLayer],
        timeout: cdk.Duration.seconds(10),
      }
    );

    // Lambda function for GET /api/seatbooking/bookings (admin)
    const getAllBookingsLambda = new lambda.Function(
      this,
      'GetAllBookingsLambda',
      {
        code: lambda.Code.fromAsset(
          path.join(
            __dirname,
            '../../apps/swivel-portal-api/dist/seat-bookings/getAllBookings.js.zip'
          )
        ),
        handler: 'getAllBookings.handler',
        runtime: lambda.Runtime.NODEJS_22_X,
        environment: {
          DB_USERNAME: process.env.DB_USERNAME || '',
          DB_PASSWORD: process.env.DB_PASSWORD || '',
        },
        layers: [sharedLayer],
        timeout: cdk.Duration.seconds(10),
      }
    );

    // Lambda function for DELETE /api/seatbooking/bookings/{id}
    const cancelBookingLambda = new lambda.Function(
      this,
      'CancelBookingLambda',
      {
        code: lambda.Code.fromAsset(
          path.join(
            __dirname,
            '../../apps/swivel-portal-api/dist/seat-bookings/cancelBooking.js.zip'
          )
        ),
        handler: 'cancelBooking.handler',
        runtime: lambda.Runtime.NODEJS_22_X,
        environment: {
          DB_USERNAME: process.env.DB_USERNAME || '',
          DB_PASSWORD: process.env.DB_PASSWORD || '',
        },
        layers: [sharedLayer],
        timeout: cdk.Duration.seconds(10),
      }
    );

    // API Gateway Lambda Authorizer
    const apiAuthorizer = new apigateway.RequestAuthorizer(
      this,
      'ApiGatewayAuthorizer',
      {
        handler: authorizerLambda,
        identitySources: [apigateway.IdentitySource.header('Authorization')],
        resultsCacheTtl: cdk.Duration.seconds(0),
      }
    );

    // API Gateway
    const api = new apigateway.RestApi(this, 'SwivelPortalApi', {
      restApiName: 'Swivel Portal Service',
      description: 'API Gateway for Swivel Portal',
      deployOptions: {
        stageName: 'dev',
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      },
    });

    // Add CORS headers to Gateway Responses (for authorizer failures)
    api.addGatewayResponse('Unauthorized', {
      type: apigateway.ResponseType.UNAUTHORIZED,
      statusCode: '401',
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Headers': "'Content-Type,Authorization'",
        'Access-Control-Allow-Methods': "'GET,POST,PUT,DELETE,OPTIONS'",
      },
    });

    api.addGatewayResponse('AccessDenied', {
      type: apigateway.ResponseType.ACCESS_DENIED,
      statusCode: '403',
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Headers': "'Content-Type,Authorization'",
        'Access-Control-Allow-Methods': "'GET,POST,PUT,DELETE,OPTIONS'",
      },
    });

    api.addGatewayResponse('Default4xx', {
      type: apigateway.ResponseType.DEFAULT_4XX,
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Headers': "'Content-Type,Authorization'",
        'Access-Control-Allow-Methods': "'GET,POST,PUT,DELETE,OPTIONS'",
      },
    });

    api.addGatewayResponse('Default5xx', {
      type: apigateway.ResponseType.DEFAULT_5XX,
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Headers': "'Content-Type,Authorization'",
        'Access-Control-Allow-Methods': "'GET,POST,PUT,DELETE,OPTIONS'",
      },
    });

    // /auth resource
    const authResource = api.root.addResource('auth');
    // /auth/login resource
    const loginResource = authResource.addResource('login');
    loginResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(loginLambda, { proxy: true }),
      {
        authorizer: apiAuthorizer,
        authorizationType: apigateway.AuthorizationType.CUSTOM,
      }
    );

    // /api resource
    const apiResource = api.root.addResource('api');
    // /api/seatbooking resource
    const seatBookingResource = apiResource.addResource('seatbooking');

    // /api/seatbooking/availability resource (GET)
    const availabilityResource =
      seatBookingResource.addResource('availability');
    availabilityResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(seatAvailabilityLambda, { proxy: true }),
      {
        authorizer: apiAuthorizer,
        authorizationType: apigateway.AuthorizationType.CUSTOM,
      }
    );

    // /api/seatbooking/bookings resource (POST, GET /me)
    const bookingsResource = seatBookingResource.addResource('bookings');
    bookingsResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(createBookingLambda, { proxy: true }),
      {
        authorizer: apiAuthorizer,
        authorizationType: apigateway.AuthorizationType.CUSTOM,
      }
    );
    // GET /api/seatbooking/bookings (admin)
    bookingsResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getAllBookingsLambda, { proxy: true }),
      {
        authorizer: apiAuthorizer,
        authorizationType: apigateway.AuthorizationType.CUSTOM,
      }
    );
    // /api/seatbooking/bookings/me (GET)
    const myBookingsResource = bookingsResource.addResource('me');
    myBookingsResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getMyBookingsLambda, { proxy: true }),
      {
        authorizer: apiAuthorizer,
        authorizationType: apigateway.AuthorizationType.CUSTOM,
      }
    );
    // /api/seatbooking/bookings/{id} (DELETE)
    const deleteBookingResource = bookingsResource.addResource('{id}');
    deleteBookingResource.addMethod(
      'DELETE',
      new apigateway.LambdaIntegration(cancelBookingLambda, { proxy: true }),
      {
        authorizer: apiAuthorizer,
        authorizationType: apigateway.AuthorizationType.CUSTOM,
      }
    );
  }
}
