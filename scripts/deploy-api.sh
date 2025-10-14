#!/bin/bash

# Deploy script for API

# clear previous zips
rm -rf ./apps/swivel-portal-api/dist

# build api and dependencies
nx build swivel-portal-api --tui false

# zip api functions
./scripts/zip-api-functions.sh

cd ./infra
npx cdk deploy SwivelPortalStack

