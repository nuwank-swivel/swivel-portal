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

    // API Gateway Lambda Authorizer
    const apiAuthorizer = new apigateway.RequestAuthorizer(
      this,
      'ApiGatewayAuthorizer',
      {
        handler: authorizerLambda,
        identitySources: [apigateway.IdentitySource.header('Authorization')],
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
  }
}
