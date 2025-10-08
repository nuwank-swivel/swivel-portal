# Epics and Implementation Status

## Epic 1: Backend Foundation

- **Status**: Not Started
- **Stories**:
  - Set up Serverless Framework project for AWS Lambda
  - Design and implement MongoDB schema with Mongoose
  - Create data access layer for core models
  - Implement basic CRUD API endpoints

## Epic 2: User Authentication

- **Status**: Not Started
- **Stories**:
  - Integrate MSAL.js in the React frontend
  - Create login page with Microsoft sign-in button
  - Implement backend token validation endpoint
  - Secure API endpoints with authentication middleware

## Epic 3: Core Booking Functionality

- **Status**: In Progress
- **Stories**:
  - Connect calendar UI to backend to fetch availability (Blocked by Epic 1)
  - Implement booking creation modal (UI Done)
  - Develop API for creating and managing bookings (Blocked by Epic 1)
  - Display user's existing bookings (Blocked by Epic 1)

## Epic 4: Admin Features

- **Status**: Not Started
- **Stories**:

- Create seat capacity management interface
- Enable per-date seat count overrides
- Implement default seat count configuration
- Add admin-only views and controls
