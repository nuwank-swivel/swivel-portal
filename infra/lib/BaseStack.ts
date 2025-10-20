import * as dotenv from 'dotenv';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { StackProps } from '../types';
import path from 'path';

export class BaseStack extends cdk.Stack {
  protected readonly envSuffix: string;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.envSuffix = props?.envName ? `-${props.envName}` : '';

    if (props?.envName === 'dev') {
      dotenv.config({ path: path.join(__dirname, '../.env.dev') });
    } else {
      dotenv.config();
    }
  }
}
