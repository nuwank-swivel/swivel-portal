import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import { StackProps } from '../types';
import { BaseStack } from './BaseStack';

export class SwivelPortalStack extends BaseStack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const DB_ENV = {
      DB_USERNAME: process.env.DB_USERNAME || '',
      DB_PASSWORD: process.env.DB_PASSWORD || '',
      DB_NAME: process.env.DB_NAME || '',
      DB_URL: process.env.DB_URL || '',
    };

    // Lambda Layer from infra/layers/layer.zip
    const sharedLayer = new lambda.LayerVersion(
      this,
      `SwivelPortalSharedLayer${this.envSuffix}`,
      {
        code: lambda.Code.fromAsset(
          path.join(__dirname, '../layers/layer.zip')
        ),
        compatibleRuntimes: [lambda.Runtime.NODEJS_22_X],
        description: `Shared layer for Swivel Portal Lambdas${this.envSuffix}`,
        layerVersionName: `SwivelPortalSharedLayer${this.envSuffix}`,
      }
    );

    // Lambda function for /auth/login
    const loginLambda = new lambda.Function(
      this,
      `AuthLoginLambda${this.envSuffix}`,
      {
        code: lambda.Code.fromAsset(
          path.join(
            __dirname,
            '../../apps/swivel-portal-api/dist/auth/login.js.zip'
          )
        ),
        handler: 'login.handler',
        runtime: lambda.Runtime.NODEJS_22_X,
        functionName: `AuthLoginLambda${this.envSuffix}`,
        environment: {
          ...DB_ENV,
          ADMIN_GROUP_ID: process.env.ADMIN_GROUP_ID || '',
        },
        layers: [sharedLayer],
        timeout: cdk.Duration.seconds(10),
      }
    );

    // Lambda function for custom authorizer
    const authorizerLambda = new lambda.Function(
      this,
      `ApiAuthorizerLambda${this.envSuffix}`,
      {
        code: lambda.Code.fromAsset(
          path.join(
            __dirname,
            '../../apps/swivel-portal-api/dist/auth/authorizor.js.zip'
          )
        ),
        handler: 'authorizor.handler',
        runtime: lambda.Runtime.NODEJS_22_X,
        functionName: `ApiAuthorizerLambda${this.envSuffix}`,
        environment: {
          MS_ENTRA_PUBLIC_KEY: process.env.MS_ENTRA_PUBLIC_KEY || '',
          ADMIN_GROUP_ID: process.env.ADMIN_GROUP_ID || '',
        },
      }
    );

    // Lambda function for seat availability
    const seatAvailabilityLambda = new lambda.Function(
      this,
      `SeatAvailabilityLambda${this.envSuffix}`,
      {
        code: lambda.Code.fromAsset(
          path.join(
            __dirname,
            '../../apps/swivel-portal-api/dist/availability/getAvailability.js.zip'
          )
        ),
        handler: 'getAvailability.handler',
        runtime: lambda.Runtime.NODEJS_22_X,
        functionName: `SeatAvailabilityLambda${this.envSuffix}`,
        environment: {
          ...DB_ENV,
        },
        layers: [sharedLayer],
        timeout: cdk.Duration.seconds(10),
      }
    );

    // Lambda function for creating bookings
    const createBookingLambda = new lambda.Function(
      this,
      `CreateBookingLambda${this.envSuffix}`,
      {
        code: lambda.Code.fromAsset(
          path.join(
            __dirname,
            '../../apps/swivel-portal-api/dist/seat-bookings/seatBookings.js.zip'
          )
        ),
        handler: 'seatBookings.handler',
        runtime: lambda.Runtime.NODEJS_22_X,
        functionName: `CreateBookingLambda${this.envSuffix}`,
        environment: {
          ...DB_ENV,
        },
        layers: [sharedLayer],
        timeout: cdk.Duration.seconds(10),
      }
    );

    // Lambda function for GET /api/seatbooking/bookings/me
    const getMyBookingsLambda = new lambda.Function(
      this,
      `GetMyBookingsLambda${this.envSuffix}`,
      {
        code: lambda.Code.fromAsset(
          path.join(
            __dirname,
            '../../apps/swivel-portal-api/dist/seat-bookings/getMyBookings.js.zip'
          )
        ),
        handler: 'getMyBookings.handler',
        runtime: lambda.Runtime.NODEJS_22_X,
        functionName: `GetMyBookingsLambda${this.envSuffix}`,
        environment: {
          ...DB_ENV,
        },
        layers: [sharedLayer],
        timeout: cdk.Duration.seconds(10),
      }
    );

    // Lambda function for GET /api/seatbooking/bookings (admin)
    const getAllBookingsLambda = new lambda.Function(
      this,
      `GetAllBookingsLambda${this.envSuffix}`,
      {
        code: lambda.Code.fromAsset(
          path.join(
            __dirname,
            '../../apps/swivel-portal-api/dist/seat-bookings/getAllBookings.js.zip'
          )
        ),
        handler: 'getAllBookings.handler',
        runtime: lambda.Runtime.NODEJS_22_X,
        functionName: `GetAllBookingsLambda${this.envSuffix}`,
        environment: {
          ...DB_ENV,
        },
        layers: [sharedLayer],
        timeout: cdk.Duration.seconds(10),
      }
    );

    // Lambda function for DELETE /api/seatbooking/bookings/{id}
    const cancelBookingLambda = new lambda.Function(
      this,
      `CancelBookingLambda${this.envSuffix}`,
      {
        code: lambda.Code.fromAsset(
          path.join(
            __dirname,
            '../../apps/swivel-portal-api/dist/seat-bookings/cancelBooking.js.zip'
          )
        ),
        handler: 'cancelBooking.handler',
        runtime: lambda.Runtime.NODEJS_22_X,
        functionName: `CancelBookingLambda${this.envSuffix}`,
        environment: {
          ...DB_ENV,
        },
        layers: [sharedLayer],
        timeout: cdk.Duration.seconds(10),
      }
    );

    // Lambda function for GET /api/seatbooking/layout
    const getSeatLayoutLambda = new lambda.Function(
      this,
      `GetSeatLayoutLambda${this.envSuffix}`,
      {
        code: lambda.Code.fromAsset(
          path.join(
            __dirname,
            '../../apps/swivel-portal-api/dist/seat-bookings/getSeatLayout.js.zip'
          )
        ),
        handler: 'getSeatLayout.handler',
        runtime: lambda.Runtime.NODEJS_22_X,
        functionName: `GetSeatLayoutLambda${this.envSuffix}`,
        environment: {
          ...DB_ENV,
        },
        layers: [sharedLayer],
        timeout: cdk.Duration.seconds(10),
      }
    );

    // API Gateway Lambda Authorizer
    const apiAuthorizer = new apigateway.RequestAuthorizer(
      this,
      `ApiGatewayAuthorizer${this.envSuffix}`,
      {
        handler: authorizerLambda,
        identitySources: [apigateway.IdentitySource.header('Authorization')],
        resultsCacheTtl: cdk.Duration.seconds(0),
      }
    );

    // API Gateway
    const api = new apigateway.RestApi(
      this,
      `SwivelPortalApi${this.envSuffix}`,
      {
        restApiName: `Swivel Portal Service${this.envSuffix}`,
        description: `API Gateway for Swivel Portal${this.envSuffix}`,
        deployOptions: {
          stageName: props?.envName ?? 'dev',
        },
        defaultCorsPreflightOptions: {
          allowOrigins: apigateway.Cors.ALL_ORIGINS,
          allowMethods: apigateway.Cors.ALL_METHODS,
          allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
        },
      }
    );

    // Add CORS headers to Gateway Responses (for authorizer failures)
    api.addGatewayResponse(`Unauthorized`, {
      type: apigateway.ResponseType.UNAUTHORIZED,
      statusCode: '401',
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Headers': "'Content-Type,Authorization'",
        'Access-Control-Allow-Methods': "'GET,POST,PUT,DELETE,OPTIONS'",
      },
    });

    api.addGatewayResponse(`AccessDenied`, {
      type: apigateway.ResponseType.ACCESS_DENIED,
      statusCode: '403',
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Headers': "'Content-Type,Authorization'",
        'Access-Control-Allow-Methods': "'GET,POST,PUT,DELETE,OPTIONS'",
      },
    });

    api.addGatewayResponse(`Default4xx`, {
      type: apigateway.ResponseType.DEFAULT_4XX,
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Headers': "'Content-Type,Authorization'",
        'Access-Control-Allow-Methods': "'GET,POST,PUT,DELETE,OPTIONS'",
      },
    });

    api.addGatewayResponse(`Default5xx`, {
      type: apigateway.ResponseType.DEFAULT_5XX,
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Headers': "'Content-Type,Authorization'",
        'Access-Control-Allow-Methods': "'GET,POST,PUT,DELETE,OPTIONS'",
      },
    });

    // /auth resource
    const authResource = api.root.addResource(`auth`);
    // /auth/login resource
    const loginResource = authResource.addResource(`login`);
    loginResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(loginLambda, { proxy: true }),
      {
        authorizer: apiAuthorizer,
        authorizationType: apigateway.AuthorizationType.CUSTOM,
      }
    );

    // /api resource
    const apiResource = api.root.addResource(`api`);
    // /api/seatbooking resource
    const seatBookingResource = apiResource.addResource(`seatbooking`);

    // /api/seatbooking/availability resource (GET)
    const availabilityResource =
      seatBookingResource.addResource(`availability`);
    availabilityResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(seatAvailabilityLambda, { proxy: true }),
      {
        authorizer: apiAuthorizer,
        authorizationType: apigateway.AuthorizationType.CUSTOM,
      }
    );

    // /api/seatbooking/bookings resource (POST, GET /me)
    const bookingsResource = seatBookingResource.addResource(`bookings`);
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
    const myBookingsResource = bookingsResource.addResource(`me`);
    myBookingsResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getMyBookingsLambda, { proxy: true }),
      {
        authorizer: apiAuthorizer,
        authorizationType: apigateway.AuthorizationType.CUSTOM,
      }
    );
    // /api/seatbooking/bookings/{id} (DELETE)
    const deleteBookingResource = bookingsResource.addResource(`{id}`);
    deleteBookingResource.addMethod(
      'DELETE',
      new apigateway.LambdaIntegration(cancelBookingLambda, { proxy: true }),
      {
        authorizer: apiAuthorizer,
        authorizationType: apigateway.AuthorizationType.CUSTOM,
      }
    );

    // /api/seatbooking/layout resource (GET)
    const layoutResource = seatBookingResource.addResource('layout');
    layoutResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getSeatLayoutLambda, { proxy: true }),
      {
        authorizer: apiAuthorizer,
        authorizationType: apigateway.AuthorizationType.CUSTOM,
      }
    );
    // --- TEAM Lambda Functions ---
    const createTeamLambda = new lambda.Function(
      this,
      `CreateTeamLambda${this.envSuffix}`,
      {
        code: lambda.Code.fromAsset(
          path.join(
            __dirname,
            '../../apps/swivel-portal-api/dist/teams/createTeam.js.zip'
          )
        ),
        handler: 'createTeam.handler',
        runtime: lambda.Runtime.NODEJS_22_X,
        functionName: `CreateTeamLambda${this.envSuffix}`,
        environment: {
          ...DB_ENV,
        },
        layers: [sharedLayer],
        timeout: cdk.Duration.seconds(10),
      }
    );

    const listTeamsLambda = new lambda.Function(
      this,
      `ListTeamsLambda${this.envSuffix}`,
      {
        code: lambda.Code.fromAsset(
          path.join(
            __dirname,
            '../../apps/swivel-portal-api/dist/teams/listTeams.js.zip'
          )
        ),
        handler: 'listTeams.handler',
        runtime: lambda.Runtime.NODEJS_22_X,
        functionName: `ListTeamsLambda${this.envSuffix}`,
        environment: {
          ...DB_ENV,
        },
        layers: [sharedLayer],
        timeout: cdk.Duration.seconds(10),
      }
    );

    const updateTeamLambda = new lambda.Function(
      this,
      `UpdateTeamLambda${this.envSuffix}`,
      {
        code: lambda.Code.fromAsset(
          path.join(
            __dirname,
            '../../apps/swivel-portal-api/dist/teams/updateTeam.js.zip'
          )
        ),
        handler: 'updateTeam.handler',
        runtime: lambda.Runtime.NODEJS_22_X,
        functionName: `UpdateTeamLambda${this.envSuffix}`,
        environment: {
          ...DB_ENV,
        },
        layers: [sharedLayer],
        timeout: cdk.Duration.seconds(10),
      }
    );

    const deleteTeamLambda = new lambda.Function(
      this,
      `DeleteTeamLambda${this.envSuffix}`,
      {
        code: lambda.Code.fromAsset(
          path.join(
            __dirname,
            '../../apps/swivel-portal-api/dist/teams/deleteTeam.js.zip'
          )
        ),
        handler: 'deleteTeam.handler',
        runtime: lambda.Runtime.NODEJS_22_X,
        functionName: `DeleteTeamLambda${this.envSuffix}`,
        environment: {
          ...DB_ENV,
        },
        layers: [sharedLayer],
        timeout: cdk.Duration.seconds(10),
      }
    );

    const searchUserLambda = new lambda.Function(
      this,
      `SearchUserLambda${this.envSuffix}`,
      {
        code: lambda.Code.fromAsset(
          path.join(
            __dirname,
            '../../apps/swivel-portal-api/dist/users/searchUsers.js.zip'
          )
        ),
        handler: 'searchUsers.handler',
        runtime: lambda.Runtime.NODEJS_22_X,
        functionName: `SearchUserLambda${this.envSuffix}`,
        environment: {
          ...DB_ENV,
        },
        layers: [sharedLayer],
        timeout: cdk.Duration.seconds(10),
      }
    );

    // --- TEAM API Gateway Resources ---
    const teamResource = apiResource.addResource('team');
    // POST /api/team (create)
    teamResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(createTeamLambda, { proxy: true }),
      {
        authorizer: apiAuthorizer,
        authorizationType: apigateway.AuthorizationType.CUSTOM,
      }
    );
    // GET /api/team (list)
    teamResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(listTeamsLambda, { proxy: true }),
      {
        authorizer: apiAuthorizer,
        authorizationType: apigateway.AuthorizationType.CUSTOM,
      }
    );

    // PUT /api/team (update)
    teamResource.addMethod(
      'PUT',
      new apigateway.LambdaIntegration(updateTeamLambda, { proxy: true }),
      {
        authorizer: apiAuthorizer,
        authorizationType: apigateway.AuthorizationType.CUSTOM,
      }
    );
    // DELETE /api/team (delete)
    teamResource.addMethod(
      'DELETE',
      new apigateway.LambdaIntegration(deleteTeamLambda, { proxy: true }),
      {
        authorizer: apiAuthorizer,
        authorizationType: apigateway.AuthorizationType.CUSTOM,
      }
    );

    // --- USER API Gateway Resources ---
    const userResource = apiResource.addResource('user');
    // GET /api/user
    userResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(searchUserLambda, { proxy: true }),
      {
        authorizer: apiAuthorizer,
        authorizationType: apigateway.AuthorizationType.CUSTOM,
      }
    );
  }
}
