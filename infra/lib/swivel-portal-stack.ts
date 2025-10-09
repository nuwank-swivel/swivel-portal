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
        // Add environment variables if needed
        DB_USERNAME: process.env.DB_USERNAME || '',
        DB_PASSWORD: process.env.DB_PASSWORD || '',
      },
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'SwivelPortalApi', {
      restApiName: 'Swivel Portal Service',
      description: 'API Gateway for Swivel Portal',
      deployOptions: {
        stageName: 'dev',
      },
    });

    // /auth resource
    const authResource = api.root.addResource('auth');
    // /auth/login resource
    const loginResource = authResource.addResource('login');
    loginResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(loginLambda, { proxy: true })
    );
  }
}
