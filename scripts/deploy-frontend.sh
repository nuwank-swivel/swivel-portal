#!/bin/bash

# Deploy script for API

# clear previous zips
rm -rf ./apps/swivel-portal/build

# build api and dependencies
nx build swivel-portal --tui false

cd ./infra
npx cdk deploy SwivelPortalFrontendStack

