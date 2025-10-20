# 2. Technical Stack

## 2.1 Frontend Stack

- **Framework**: React 19 with TypeScript 5.x
- **Monorepo**: Nx (Nrwl Extensions)
- **Build Tool**: Nx
- **UI Framework**: Mantine (React) with Tailwind CSS
- **State Management**: React Context + Hooks
- **Authentication**: Microsoft Entra ID (Azure AD) SSO via Microsoft Teams (no direct MSAL.js usage)
- **HTTP Client**: Axios with interceptors
- **Testing**: Vitest + React Testing Library
- **Package Manager**: Bun (for improved performance)
- **Code Quality**:
  - ESLint with TypeScript rules
  - Prettier
  - Husky for pre-commit hooks
  - lint-staged for staged files

> **Note:** The frontend is only accessible as a Microsoft Teams Tab. It cannot be accessed as a standalone web or PWA app. All authentication is handled by Teams SSO and Microsoft Entra ID.

## 2.2 Backend Stack

- **Monorepo**: Nx (Nrwl Extensions)
- **Runtime**: Node.js (LTS version) on AWS Lambda
- **Language**: TypeScript
- **Framework**: AWS CDK for deployment
- **API Gateway**: Amazon API Gateway for routing and exposure
- **Authentication**: Custom Lambda Authorizer for Azure AD token validation
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
