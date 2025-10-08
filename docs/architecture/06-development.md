# 7. Development Workflow

## 7.1 Architectural Pattern and Monorepo Structure

To ensure a clean separation of concerns and enhance portability, the backend follows a specific architectural pattern. The AWS Lambda functions in `apps/swivel-portal-api` act as a thin controller layer, responsible only for handling incoming requests and outgoing responses. All core business logic is encapsulated within the `libs/domain` library, while data access is handled exclusively by the `libs/dal` library.

This pattern prevents cloud-specific details (like AWS Lambda event types) from leaking into the core business logic, making the application easier to test, maintain, and potentially migrate to a different cloud provider in the future.

### 7.1.1 Information Flow

The flow of information is strictly unidirectional:

1.  An **AWS Lambda function** in `apps/swivel-portal-api` receives a request from the API Gateway.
2.  The Lambda function **invokes a function** from the `libs/domain` library, passing the necessary input data.
3.  The `libs/domain` function executes the core **business logic**.
4.  If data access is required, the `libs/domain` function calls a function from the `libs/dal` library.
5.  The `libs/dal` function **interacts with the database** (e.g., MongoDB Atlas).
6.  The result is returned up the chain to the Lambda function, which then formats and sends the HTTP response.

```mermaid
graph TD
    subgraph "apps/swivel-portal-api"
        A[AWS Lambda Function]
    end

    subgraph "libs/domain"
        B[Business Logic]
    end

    subgraph "libs/dal"
        C[Data Access Layer]
    end

    D[(MongoDB Atlas)]

    A -->|Invokes| B
    B -->|Uses| C
    C -->|Reads/Writes| D
```

### 7.1.2 Monorepo Structure

The project is structured as an Nx monorepo, which contains the frontend application, backend services, and shared libraries in a single repository. This approach enhances code sharing, improves dependency management, and simplifies cross-functional development.

- **`src/swivel-portal/`**: The root of the Nx workspace.
  - **`apps/`**: Contains the deployable applications.
    - `swivel-portal/`: The main React frontend application.
    - `swivel-portal-api/`: The Node.js backend with AWS Lambda functions. **(Thin Controller Layer)**
  - **`libs/`**: Houses the shared libraries, promoting code reuse and separation of concerns.
    - `dal/`: The Data Access Layer, responsible for all database interactions. **(Data Access Logic)**
    - `domain/`: Contains the core business logic and domain models. **(Business Logic)**
    - `types/`: Defines shared TypeScript types and interfaces used across the monorepo.
  - **`infra/`**: Includes the AWS CDK project for defining and deploying cloud infrastructure.

## 7.2 Git Workflow

- **Main Branches**:
  - `main` - Production code
  - `develop` - Development code
  - `release/*` - Release candidates

- **Feature Branches**:
  - Format: `feature/[ticket-id]-description`
  - Example: `feature/SEAT-123-implement-booking-modal`

- **Commit Convention**:
  ```text
  type(scope): description

  [optional body]

  [optional footer]
  ```
  Types: feat, fix, docs, style, refactor, test, chore

## 7.3 Code Quality Standards

- **TypeScript**: Strict mode enabled across all libraries and applications.
- **ESLint**: Configured at the root of the monorepo to enforce consistent coding standards.
- **Test Coverage**: A minimum of 80% is required for all shared libraries and critical application logic.
- **Pull Request Requirements**:
  - No failing tests.
  - Meet coverage requirements.
  - Pass linting checks.
  - Code review by at least one other developer.
  - No security vulnerabilities.

## 7.4 Build and Deploy Pipeline

The build and deployment process is managed by Nx and the AWS CDK.

```mermaid
graph LR
    A[Commit] -->|Trigger| B[Nx Affected Build]
    B -->|Run Affected Tests| C[Test]
    C -->|Quality Gates| D[Quality]
    D -->|Deploy with CDK| E[Dev]
    E -->|Manual Approval| F[QA]
    F -->|Manual Approval| G[Prod]
```
