# 5. Technical Architecture

## 5.1 Monorepo Architecture

The project has been migrated to an Nx monorepo to unify the development of the frontend, backend, and shared libraries. This structure improves code consistency, simplifies dependency management, and streamlines the overall development process.

- **`apps/`**: Contains the deployable applications, `swivel-portal` (React) and `swivel-portal-api` (Node.js).
- **`libs/`**: Includes shared libraries for `dal` (Data Access Layer), `domain` (business logic), and `types` (shared interfaces).

### Frontend Architecture

- **Framework**: React 18+ with TypeScript, built and managed with Nx.
- **UI Components**: ShadcnUI for the component library, with custom components for calendars and modals.
- **Authentication**: MSAL React for Azure AD integration and protected routes.
- **State Management**: React Context and Hooks for managing application state.
- **API Communication**: A dedicated API integration layer for handling communication with the backend.

### Backend Architecture

- **Runtime**: AWS Lambda with TypeScript, managed within the Nx monorepo.
- **API Gateway**: Amazon API Gateway for defining and exposing RESTful endpoints.
- **Authentication**: Azure AD integration for secure authentication.
- **Data Access**: Mongoose for interacting with the MongoDB database, with the logic encapsulated in the `dal` library.
- **Logging**: Structured logging is implemented using Amazon CloudWatch.

## 5.2 Database Design

- **Database**: MongoDB, hosted on MongoDB Atlas.
- **Collections**:
  - `users`: Stores user profile information.
  - `seatConfigurations`: Defines global settings for seat availability.
  - `daySeatOverrides`: Manages exceptions and overrides for daily capacity.
  - `bookings`: Tracks all reservation data.
