# 1. System Overview

## 1.1 Architecture Overview

The Company Portal PWA is designed as a modern, secure, and scalable web application with the following high-level architecture:

- **Frontend**: React 18+ PWA with TypeScript and Vite
- **Backend**: .NET 9 Minimal API
- **Database**: Azure SQL
- **Authentication**: Azure AD (Microsoft 365)
- **Hosting**: Azure App Service
- **CI/CD**: Azure DevOps Pipelines

## 1.2 System Architecture Diagram

```mermaid
graph TD
    Client[Browser/PWA Client] -->|HTTPS| API[Azure App Service<br/>.NET 9 API]
    API -->|JWT Validation| Auth[Azure AD]
    API -->|Entity Framework Core| DB[(Azure SQL)]
    Client -->|MSAL.js| Auth
```
