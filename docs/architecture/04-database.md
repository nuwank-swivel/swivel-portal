# 5. Database Design

## 5.1 Data Model (DynamoDB Single-Table Design)

The application uses a single-table design in DynamoDB, leveraging composite keys and secondary indexes for efficient access patterns. We use ElectroDB as our data modeling library.

### Primary Table Structure

```typescript
// Example composite key structure
{
  PK: string,    // Partition key - Entity type prefix with ID
  SK: string,    // Sort key - Varies by entity type
  GSI1PK: string, // For date-based queries
  GSI1SK: string, // For filtering date-based results
  // Entity-specific attributes follow
}
```

### Entity Patterns

- **Users**:

  ```typescript
  {
    PK: "USER#${azureAdId}",
    SK: "PROFILE#${azureAdId}",
    email: string,
    name: string,
    department?: string,
    isAdmin: boolean,
    firstLogin: string, // ISO date
    lastLogin: string,  // ISO date
    createdAt: string   // ISO date
  }
  ```

- **Seat Configurations**:

  ```typescript
  {
    PK: "CONFIG#SEATS",
    SK: "CURRENT",
    defaultSeatCount: number,
    lastModified: string,
    modifiedBy: string  // Azure AD ID
  }
  ```

- **Day Seat Overrides**:

  ```typescript
  {
    PK: "OVERRIDE#${date}",  // YYYY-MM-DD
    SK: "SEATS",
    seatCount: number,
    createdAt: string,
    createdBy: string   // Azure AD ID
  }
  ```

- **Bookings**:

  ```typescript
  {
    PK: "DATE#${bookingDate}",  // YYYY-MM-DD
    SK: "USER#${azureAdId}",
    GSI1PK: "USER#${azureAdId}",
    GSI1SK: "BOOKING#${bookingDate}",
    startTime: string,
    endTime: string,
    lunchOption: string,
    createdAt: string
  }
  ```

- **Lunch Options**:

  ```typescript
  {
    PK: "LUNCH#${name}",
    SK: "OPTION",
    description: string,
    createdAt: string,
    createdBy: string   // Azure AD ID
  }
  ```

## 5.2 User Synchronization Flow

1.  **Initial Authentication**:

    - User logs in via MSAL.js in the frontend.
    - Frontend obtains an Azure AD access token.
    - Frontend sends the token to the backend API (e.g., `/api/auth/login`).

2.  **User Creation/Update (Backend)**:

    - The backend Lambda function receives the token.
    - It uses a library like `passport-azure-ad` to validate the token against Azure AD's configuration.
    - Upon successful validation, the backend extracts user info from the token payload (Azure AD Object ID, email, name, etc.).
    - The backend searches the `users` collection for a document with a matching `azureAdId`.
    - **If new user**:
      - A new document is created in the `users` collection.
      - `firstLogin` and `createdAt` are set.
      - The backend can optionally use the Microsoft Graph API (with appropriate permissions) to check for admin group membership.
    - **If existing user**:
      - `name` and `email` are updated if they have changed.
      - `lastLogin` timestamp is updated.
    - The backend returns user details to the frontend, along with a session token if applicable.

3.  **Admin Status Management**:
    - Admin status is determined by Azure AD group membership.
    - The ID of the admin group is stored in an environment variable for the Lambda function.
    - The backend checks group membership on login and updates the `isAdmin` flag in the user's document.

## 5.3 Data Access Layer

- **Data Modeling**: ElectroDB is used for data modeling, schema validation, and queries
- **Pattern**: Repository pattern with ElectroDB services that handle entity operations
- **Transactions**: DynamoDB transactions for atomic operations across multiple items
- **Access Patterns**: Optimized through composite keys and Global Secondary Indexes (GSIs)
- **Query Efficiency**: Single-table design with careful key composition for optimal read/write performance
- **Cost Optimization**: Proper capacity planning and auto-scaling configurations

### Key Access Patterns

1. Get user by Azure AD ID

   ```typescript
   PK = USER#${azureAdId}
   SK = PROFILE#${azureAdId}
   ```

2. Get all bookings for a date

   ```typescript
   PK = DATE#${date}
   SK begins_with USER#
   ```

3. Get user's bookings for a date range

   ```typescript
   GSI1PK = USER#${azureAdId}
   GSI1SK between BOOKING#${startDate} and BOOKING#${endDate}
   ```

4. Get seat configuration and overrides

   ```typescript
   PK = CONFIG#SEATS or OVERRIDE#${date}
   SK = CURRENT or SEATS
   ```
