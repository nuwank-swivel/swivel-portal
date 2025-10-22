import * as cdk from 'aws-cdk-lib';

export interface StackProps extends cdk.StackProps {
  envName: 'dev' | 'prod' | 'production' | 'staging';
}
