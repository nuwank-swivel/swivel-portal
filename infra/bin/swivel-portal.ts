#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';

import { SwivelPortalStack } from '../lib/swivel-portal-stack';

const app = new cdk.App();

const account = process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID;
const region = 'ap-south-1';
const env: cdk.Environment | undefined = account ? { account, region } : undefined;

new SwivelPortalStack(app, 'SwivelPortalStack-dev', { env, envName: 'dev' });

new SwivelPortalStack(app, 'SwivelPortalStack-production', { env, envName: 'prod' });
