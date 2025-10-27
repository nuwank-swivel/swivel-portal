#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';

import { SwivelPortalFrontendStack } from '../lib/swivel-portal-frontend-stack';

const app = new cdk.App();

const env = { account: '845719591791', region: 'ap-south-1' };

new SwivelPortalFrontendStack(app, 'SwivelPortalFrontendStack-dev', {
  env,
  envName: 'dev',
});

new SwivelPortalFrontendStack(app, 'SwivelPortalFrontendStack-staging', {
  env,
  envName: 'staging',
});

new SwivelPortalFrontendStack(app, 'SwivelPortalFrontendStack-production', {
  env,
  envName: 'prod',
});
