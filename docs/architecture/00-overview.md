# 1. System Overview

## 1.1 Architecture Overview

Swivel Portal is a **custom Microsoft Teams Tab app** designed exclusively for use within Microsoft Teams. It is **not accessible as a standalone web application**. All authentication and access control are handled via **Microsoft Entra ID (Azure AD) SSO through Microsoft Teams**. The app leverages the Teams client for user context and authentication, ensuring that only authorized users within the organization can access the portal.

### Key Features (as of October 2025)

- **Recurring Bookings / Roaster Support**: Employees can set recurring days for automatic seat bookings (e.g., every Monday/Thursday).
- **Visual Seat Layout & Selection**: Users select seats from a visual layout, with their seat and others highlighted.
- **Booking Updates**: Users can update bookings, including meal options.
- **Super Admin Role**: Managed via Entra ID group, with elevated permissions.
- **Meal Booking Settings**: Super admins can configure meal options and set up automated daily meal booking emails.

- **Frontend**: React 19 app, loaded as a Teams Tab (not a PWA or public web app)
- **Backend**: AWS Lambda with TypeScript
- **Database**: MongoDB Atlas
- **Authentication**: Microsoft Entra ID (Azure AD) via Teams SSO
- **Hosting**: AWS Lambda & API Gateway
- **CI/CD**: Azure DevOps Pipelines

## 1.2 System Architecture Diagram

```mermaid
graph TD
    TeamsClient[Microsoft Teams Client (Tab)] -->|Teams SSO| Auth[Microsoft Entra ID (Azure AD)]
    TeamsClient -->|HTTPS| APIGateway[Amazon API Gateway]
    APIGateway --> Lambda[AWS Lambda\nTypeScript]
    Lambda -->|Mongoose| DB[(MongoDB Atlas)]
    Lambda -->|JWT Validation| Auth
```
