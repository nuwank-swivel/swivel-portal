import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class SwivelPortalStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda function for /auth/login
    const loginLambda = new NodejsFunction(this, 'AuthLoginLambda', {
      entry: '../apps/swivel-portal-api/dist/login.js',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_22_X,
      environment: {
        DB_USERNAME: process.env.DB_USERNAME || '',
        DB_PASSWORD: process.env.DB_PASSWORD || '',
      },
    });

    // Lambda function for custom authorizer
    const authorizerLambda = new NodejsFunction(this, 'ApiAuthorizerLambda', {
      entry: '../apps/swivel-portal-api/dist/authorizor.js',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_22_X,
      environment: {
        MS_ENTRA_PUBLIC_KEY: process.env.MS_ENTRA_PUBLIC_KEY || '',
      },
    });

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
  }
}
