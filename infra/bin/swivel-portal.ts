#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';

import { SwivelPortalStack } from '../lib/swivel-portal-stack';

const app = new cdk.App();

const env = { account: '845719591791', region: 'ap-south-1' };

new SwivelPortalStack(app, 'SwivelPortalStack-dev', {
  env,
  envName: 'dev',
});

new SwivelPortalStack(app, 'SwivelPortalStack-staging', {
  env,
  envName: 'staging',
});

new SwivelPortalStack(app, 'SwivelPortalStack-production', {
  env,
  envName: 'prod',
});
