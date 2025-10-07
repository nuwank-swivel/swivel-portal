# Epics and Implementation Status

## Epic 1: Data Foundation (Not Started) 🔴 - IMMEDIATE PRIORITY

- Set up Azure SQL database schema
- Create Entity Framework Core models and migrations
- Implement data access layer
- Set up initial configuration tables
- Add database connection and context configuration

## Epic 2: Authentication & Authorization (Not Started) 🔴

- Implement Microsoft 365 (Azure AD) authentication for all employees
- Set up role-based access control for admin users
- Integrate MSAL.js for secure token handling
- Configure backend JWT validation for Azure AD tokens

## Epic 3: Dashboard & Navigation (Frontend Complete) 🟡

- ✅ Create a responsive dashboard layout
- ✅ Implement tool listing functionality
- ✅ Add navigation structure for future tool additions
- Set up PWA configuration

## Epic 4: Seat Booking Calendar (Frontend Complete) 🟡

- ✅ Implement interactive calendar view
- ✅ Design seat availability display
- ✅ Enable date selection with future-only restriction
- Integrate with backend for real-time seat count

## Epic 5: Booking Management (Frontend UI Complete) 🟡

- ✅ Create booking modal with duration options
- ✅ Design booking workflow UI
- Implement API integration for booking submission
- Add booking confirmation system
- Enable booking cancellation
- Display user's existing bookings

## Epic 6: Admin Features (Not Started) 🔴

- Create seat capacity management interface
- Enable per-date seat count overrides
- Implement default seat count configuration
- Add admin-only views and controls

Legend:

- ✅ Implemented
- 🟡 Partially Complete
- 🔴 Not Started
