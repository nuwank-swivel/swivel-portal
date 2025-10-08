# 2. Technical Stack

## 2.1 Frontend Stack

- **Framework**: React 18.2.0 with TypeScript 5.2
- **Build Tool**: Vite 5.0
- **UI Framework**: ShadcnUI (React) with Tailwind CSS
- **State Management**: React Context + Hooks
- **Authentication**: MSAL.js 3.0 for Azure AD
- **HTTP Client**: Axios with interceptors
- **Testing**: Vitest + React Testing Library
- **Package Manager**: Bun (for improved performance)
- **Code Quality**:
  - ESLint with TypeScript rules
  - Prettier
  - Husky for pre-commit hooks
  - lint-staged for staged files

## 2.2 Backend Stack

- **Runtime**: Node.js (LTS version) on AWS Lambda
- **Language**: TypeScript
- **Framework**: Serverless Framework or AWS CDK for deployment
- **API Gateway**: Amazon API Gateway for routing and exposure
- **Authentication**: Passport.js with the `passport-azure-ad` strategy for Azure AD token validation
- **Data Access**: Mongoose ODM or the native MongoDB Node.js driver
- **Testing**: Jest or Vitest
- **Code Quality**:
  - ESLint with TypeScript rules
  - Prettier
  - Husky for pre-commit hooks

## 2.3 Database

- **Type**: MongoDB
- **Hosting**: MongoDB Atlas (or self-hosted)
- **Schema**: Flexible schema with defined collections for core entities

## 2.4 Infrastructure

- **Compute**: AWS Lambda for serverless functions
- **API**: Amazon API Gateway
- **Database**: MongoDB Atlas
- **Identity**: Azure AD
- **Monitoring**: Amazon CloudWatch
- **CDN**: Amazon CloudFront (for static assets)
