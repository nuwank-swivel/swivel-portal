#!/bin/bash


# Deploy script for API

# Usage: ./deploy-api.sh [env]
# env: dev (default) or production
ENV_MODE=${1:-dev}
echo "Deploying API in $ENV_MODE mode"

# clear previous zips
rm -rf ./apps/swivel-portal-api/dist

# build api and dependencies
npx nx build swivel-portal-api --configuration=$ENV_MODE --tui false --skipNxCache

# zip api functions
./scripts/zip-api-functions.sh

cd ./infra
npx cdk deploy SwivelPortalStack-$ENV_MODE --context env=$ENV_MODE

