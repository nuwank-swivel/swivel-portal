#!/bin/bash


# Deploy script for Frontend

# Usage: ./deploy-frontend.sh [env]
# env: dev (default) or production
ENV_MODE=${1:-dev}
echo "Deploying Frontend in $ENV_MODE mode"

# clear previous builds
rm -rf ./apps/swivel-portal/build

# build frontend and dependencies
nx build swivel-portal --configuration=$ENV_MODE --tui false --skipNxCache

cd ./infra
npx cdk deploy SwivelPortalFrontendStack --context env=$ENV_MODE

