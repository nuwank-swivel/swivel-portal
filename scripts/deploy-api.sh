#!/bin/bash

# Deploy script for API

# clear previous zips
rm -rf ./apps/swivel-portal-api/dist

# build api and dependencies
nx build swivel-portal-api

# zip api functions
./zip-api-functions.sh

cd ./infra
cdk deploy

