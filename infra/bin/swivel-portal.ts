#!/usr/bin/env node
import * as dotenv from 'dotenv';
dotenv.config();
import * as cdk from 'aws-cdk-lib';

import { SwivelPortalStack } from '../lib/swivel-portal-stack';
import { SwivelPortalFrontendStack } from '../lib/swivel-portal-frontend-stack';

const app = new cdk.App();

const env = { account: '845719591791', region: 'us-east-1' };

new SwivelPortalStack(app, 'SwivelPortalStack', {
  env,
});

new SwivelPortalFrontendStack(app, 'SwivelPortalFrontendStack', {
  env,
});
