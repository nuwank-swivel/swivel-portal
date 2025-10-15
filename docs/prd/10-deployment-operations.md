# 10. Deployment & Operations

## 10.1 Infrastructure

- **Frontend**: AWS S3/CloudFront for hosting the React application.
- **Backend**: AWS Lambda with Amazon API Gateway for serverless functions.
- **Database**: AWS DynamoDB with single-table design.
- **Infrastructure as Code**: AWS CDK for defining and managing all cloud resources.
- **CI/CD**: GitHub Actions with Nx Cloud for efficient monorepo builds.

## 10.2 Monitoring

- **Performance**: Uptime and performance are monitored using Amazon CloudWatch.
- **Error Tracking**: Sentry is used for real-time error tracking.
- **Logging**: Backend functions are configured with log aggregation for easier debugging.

## 10.3 Backup & Recovery

- **Database**: DynamoDB Point-in-time Recovery (PITR) for continuous backups.
- **Infrastructure**: The use of AWS CDK for infrastructure-as-code facilitates disaster recovery and environment replication.
