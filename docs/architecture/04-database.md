# 5. Database Design

## 5.1 Data Model (MongoDB)

Instead of a relational schema, we will use a collection-based NoSQL model in MongoDB.

- **`users` collection**:
  - `_id`: ObjectId (Primary Key)
  - `azureAdId`: String (Indexed, Unique) - The Azure AD Object ID.
  - `email`: String
  - `name`: String
  - `department`: String (Optional)
  - `isAdmin`: Boolean
  - `firstLogin`: Date
  - `lastLogin`: Date
  - `createdAt`: Date

- **`seatConfigurations` collection**:
  - `_id`: ObjectId
  - `defaultSeatCount`: Number
  - `lastModified`: Date
  - `modifiedBy`: ObjectId (references `users._id`)

- **`daySeatOverrides` collection**:
  - `_id`: ObjectId
  - `date`: ISODate (e.g., "2025-10-28T00:00:00.000Z")
  - `seatCount`: Number
  - `createdAt`: Date
  - `createdBy`: ObjectId (references `users._id`)

- **`bookings` collection**:
  - `_id`: ObjectId
  - `userId`: ObjectId (references `users._id`)
  - `bookingDate`: ISODate
  - `startTime`: String (e.g., "09:00")
  - `endTime`: String (e.g., "17:00")
  - `createdAt`: Date

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

- **ODM**: Mongoose is used for data modeling, schema validation, and queries.
- **Pattern**: A repository-like pattern can be implemented with services that encapsulate Mongoose models.
- **Transactions**: For multi-document operations, MongoDB transactions will be used to ensure atomicity.
- **Asynchronous Operations**: All database operations are asynchronous, using async/await.
- **Indexing**: Proper indexes are created on fields like `azureAdId` and `bookingDate` to optimize query performance.
