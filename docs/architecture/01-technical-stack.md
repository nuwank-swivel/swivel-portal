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

- **Framework**: .NET 9 Minimal API
- **Authentication**: Microsoft.Identity.Web
- **Database Access**: Entity Framework Core 9.0
- **API Documentation**: Swagger/OpenAPI
- **Logging**: Serilog with Azure App Insights
- **Testing**: xUnit with Moq
- **Code Quality**:
  - .NET Analyzer
  - StyleCop
  - SonarQube integration

## 2.3 Database

- **Type**: Azure SQL
- **ORM**: Entity Framework Core 9.0
- **Migrations**: EF Core Code-First Migrations
- **Backup**: Azure Automated Backups

## 2.4 Infrastructure

- **Hosting**: Azure App Service (Frontend & Backend)
- **Database**: Azure SQL
- **Identity**: Azure AD
- **Monitoring**: Application Insights
- **CDN**: Azure CDN (for static assets)
