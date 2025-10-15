import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as path from 'path';
import { CfnOriginAccessControl } from 'aws-cdk-lib/aws-cloudfront';
import { StackProps } from '../types';

export class SwivelPortalFrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const envSuffix = props?.envName ? `-${props.envName}` : '';

    // S3 bucket for static site hosting (private, no website hosting)
    const siteBucket = new s3.Bucket(
      this,
      `SwivelPortalSiteBucket${envSuffix}`,
      {
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
      }
    );

    // Create Origin Access Control (OAC) for CloudFront to access S3 securely
    const oac = new CfnOriginAccessControl(
      this,
      `SwivelPortalOAC${envSuffix}`,
      {
        originAccessControlConfig: {
          name: `SwivelPortalOAC${envSuffix}`,
          originAccessControlOriginType: 's3',
          signingBehavior: 'always',
          signingProtocol: 'sigv4',
          description: `OAC for CloudFront to access S3 bucket${envSuffix}`,
        },
      }
    );

    // CloudFront L1 distribution with OAC and no OAI
    const s3OriginId = 'S3Origin';
    const cfnDistribution = new cloudfront.CfnDistribution(
      this,
      `SwivelPortalDistribution${envSuffix}`,
      {
        distributionConfig: {
          enabled: true,
          defaultRootObject: 'index.html',
          comment: `SwivelPortalDistribution${envSuffix}`,
          origins: [
            {
              id: `${s3OriginId}${envSuffix}`,
              domainName: siteBucket.bucketRegionalDomainName,
              originAccessControlId: oac.ref,
              s3OriginConfig: {},
            },
          ],
          defaultCacheBehavior: {
            targetOriginId: `${s3OriginId}${envSuffix}`,
            viewerProtocolPolicy: 'redirect-to-https',
            allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
            cachedMethods: ['GET', 'HEAD'],
            compress: true,
            forwardedValues: {
              queryString: false,
              cookies: { forward: 'none' },
            },
          },
          customErrorResponses: [
            {
              errorCode: 403,
              responseCode: 200,
              responsePagePath: '/index.html',
            },
            {
              errorCode: 404,
              responseCode: 200,
              responsePagePath: '/index.html',
            },
          ],
          priceClass: 'PriceClass_100',
        },
      }
    );

    // Grant CloudFront access to the S3 bucket using OAC
    siteBucket.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [siteBucket.arnForObjects('*')],
        principals: [
          new cdk.aws_iam.ServicePrincipal('cloudfront.amazonaws.com'),
        ],
        conditions: {
          StringEquals: {
            'AWS:SourceArn': `arn:aws:cloudfront::${
              cdk.Stack.of(this).account
            }:distribution/${cfnDistribution.ref}`,
          },
        },
      })
    );

    // Deploy React build output to S3

    new s3deploy.BucketDeployment(this, `DeploySwivelPortalSite${envSuffix}`, {
      sources: [
        s3deploy.Source.asset(
          path.join(__dirname, '../../apps/swivel-portal/build/client')
        ),
      ],
      destinationBucket: siteBucket,
      distribution: undefined, // can't use L2 distribution here
      // Optionally, you can invalidate manually after deployment
    });

    // Output the CloudFront URL
    new cdk.CfnOutput(this, `CloudFrontURL${envSuffix}`, {
      value: cdk.Fn.join('', ['https://', cfnDistribution.attrDomainName]),
      description: 'The CloudFront distribution URL for the React app',
    });
  }
}
