# Company Portal PWA - Seat Booking System PRD

**Product Name:** Company Portal PWA (Seat Booking PoC)  
**Date:** 2025-10-07  
**Status:** In Progress  
**Author:** Product Team  
**Implementation Status:** Frontend UI components implemented, API integration pending

## Current Implementation Status

The following components have been implemented in the React frontend:

1. **Dashboard Layout** (`src/frontend/src/pages/Dashboard.tsx`)

   - Basic responsive layout
   - Tool listing functionality
   - Navigation structure

2. **Seat Booking Calendar** (`src/frontend/src/pages/SeatBooking.tsx`)

   - Calendar view implementation
   - Seat availability display structure
   - Date selection UI

3. **Booking Management** (`src/frontend/src/components/booking/`)
   - Booking modal UI (`BookingModal.tsx`)
   - Seat card component (`SeatCard.tsx`)
   - Form controls for duration and time selection

Pending Implementation:

1. Authentication & Authorization (MSAL.js integration)
2. API Integration for all components
3. Admin features
4. Backend API implementation
5. Database setup and configuration

## Product Vision

Create a user-friendly Progressive Web App that serves as the central hub for company tools, starting with an efficient seat booking system that enables employees to reserve workspace seamlessly while helping administrators manage office capacity effectively.

## Epics and Implementation Status

### Epic 1: Data Foundation (Not Started) 🔴 - IMMEDIATE PRIORITY

- Set up Azure SQL database schema
- Create Entity Framework Core models and migrations
- Implement data access layer
- Set up initial configuration tables
- Add database connection and context configuration

### Epic 2: Authentication & Authorization (Not Started) 🔴

- Implement Microsoft 365 (Azure AD) authentication for all employees
- Set up role-based access control for admin users
- Integrate MSAL.js for secure token handling
- Configure backend JWT validation for Azure AD tokens

### Epic 3: Dashboard & Navigation (Frontend Complete) 🟡

- ✅ Create a responsive dashboard layout
- ✅ Implement tool listing functionality
- ✅ Add navigation structure for future tool additions
- Set up PWA configuration

### Epic 4: Seat Booking Calendar (Frontend Complete) 🟡

- ✅ Implement interactive calendar view
- ✅ Design seat availability display
- ✅ Enable date selection with future-only restriction
- Integrate with backend for real-time seat count

### Epic 5: Booking Management (Frontend UI Complete) 🟡

- ✅ Create booking modal with duration options
- ✅ Design booking workflow UI
- Implement API integration for booking submission
- Add booking confirmation system
- Enable booking cancellation
- Display user's existing bookings

### Epic 6: Admin Features (Not Started) 🔴

- Create seat capacity management interface
- Enable per-date seat count overrides
- Implement default seat count configuration
- Add admin-only views and controls

Legend:

- ✅ Implemented
- 🟡 Partially Complete
- 🔴 Not Started

## Implementation Status

### Completed Components

- Frontend scaffold with React + Vite
- ShadcnUI component library integration
- Dashboard page implementation
- Seat booking page with calendar component
- Booking modal UI
- Backend scaffold with .NET 9 Minimal API

### Pending Components

- Authentication implementation (MSAL + Azure AD)
- Login page UI
- API integration for all endpoints
- PWA configuration
- Production deployment setup

## 1. Product Overview

### 1.1 Problem Statement

Employees need a streamlined way to book office seats in advance, while office administrators need to manage seat capacity effectively. The current process lacks automation and centralized management.

### 1.2 Solution

A Progressive Web App (PWA) that serves as a company portal, with the initial feature being a seat booking system. The system will allow employees to book seats and administrators to manage seat capacity through a user-friendly interface.

### 1.3 Target Users

- **Primary:** Company employees needing to book office seats
- **Secondary:** Office administrators managing seat capacity
- **Authentication:** All users authenticate via Microsoft 365 accounts

## 2. Requirements

### 2.1 Core Features

#### Authentication (To Be Implemented)

- Single Sign-On via Microsoft 365 (Azure AD)
- Role-based access control (Employee vs Admin)
- Secure token-based API authentication
- Login page with Microsoft authentication button
- Token management and refresh logic
- Protected route implementation

#### Dashboard (Implemented)

- Clean, minimalist interface using ShadcnUI components
- Tools listing section with seat booking feature
- Responsive design supporting desktop and mobile devices
- Integration with authentication context needed

#### Seat Booking System (Partially Implemented)

- Interactive calendar for date selection (Implemented)
- ShadcnUI modal for booking interface (Implemented)
- Real-time seat availability display (API integration pending)
- Flexible booking durations (1 hour, half-day, full-day) (UI implemented)
- User booking management (API integration pending)
- Admin capacity management (API integration pending)

### 2.2 Technical Requirements

#### Frontend

- React + Vite application
- MSAL.js integration for Azure AD authentication
- PWA capabilities with offline support
- Responsive UI using modern components
- Real-time availability updates

#### Backend

- .NET 9 Minimal API
- Azure AD token validation
- EF Core with SQL Server
- Transactional data integrity
- Caching for performance optimization

#### Database

- Normalized schema for users, bookings, and configurations
- Efficient querying for availability checks
- Concurrency handling for booking conflicts

## 3. User Stories

### 3.1 Authentication

1. As an employee, I can sign in with my Microsoft 365 account
2. As an admin, I can access additional seat management features
3. As a user, I remain authenticated across sessions

### 3.2 Booking Management

1. As an employee, I can view available seats for any future date
2. As an employee, I can book a seat for various durations
3. As an employee, I can view and cancel my bookings
4. As an admin, I can modify seat capacity for specific dates
5. As an admin, I can set the default seat count

## 4. User Interface

### 4.1 Navigation

- Simple top navigation bar
- Dashboard as home page
- Tools section with seat booking tile

### 4.2 Booking Flow

1. Select date from calendar
2. View available seats
3. Click "Book a seat"
4. Choose duration and time
5. Confirm booking
6. Receive confirmation

### 4.3 Admin Interface

- Integrated seat count management in booking modal
- Default seat count configuration in settings
- Override management for specific dates

## 5. Technical Architecture

### 5.1 Frontend Architecture

#### Current Implementation

- React 18+ with TypeScript
- Vite build system
- ShadcnUI component library
- Calendar and modal components
- Basic routing setup

#### To Be Implemented

- MSAL React for authentication
- Protected routes wrapper
- PWA manifest and service worker
- API integration layer
- Error handling and loading states

### 5.2 Backend Architecture

- ASP.NET Core Minimal API
- Azure AD integration
- EF Core with SQL Server
- RESTful API endpoints
- Structured logging with Serilog

### 5.3 Database Design

- Users table for profile data
- SeatConfig for global settings
- DaySeatOverrides for capacity management
- Bookings for reservation tracking

## 6. API Endpoints

### Public Endpoints

- Health check endpoint

### Protected Endpoints

1. GET /api/tools
2. GET /api/seatbooking/availability
3. GET /api/seatbooking/bookings/me
4. POST /api/seatbooking/bookings
5. DELETE /api/seatbooking/bookings/{id}
6. GET /api/seatbooking/day-overrides
7. PUT /api/seatbooking/day-overrides/{date}
8. GET /api/seatbooking/config
9. PUT /api/seatbooking/config/default-seat-count

## 7. Security

### 7.1 Authentication

- Azure AD integration
- JWT token validation
- Secure token storage
- HTTPS enforcement

### 7.2 Authorization

- Role-based access control
- Admin privileges via Azure AD groups
- API endpoint protection

## 8. Performance Requirements

### 8.1 Response Times

- Page load: < 2 seconds
- API responses: < 500ms
- Booking confirmation: < 1 second

### 8.2 Scalability

- Support for entire company workforce
- Efficient database queries
- Caching strategy for common requests

## 9. Testing Strategy

### 9.1 Unit Testing

- Backend business logic
- Frontend components
- Authentication flows

### 9.2 Integration Testing

- API endpoint testing
- Database operations
- Authentication integration

### 9.3 User Acceptance Testing

- Booking workflow
- Admin operations
- Cross-browser compatibility

## 10. Deployment & Operations

### 10.1 Infrastructure

- Azure App Service or Container Apps
- Azure SQL Database
- Azure AD for authentication

### 10.2 Monitoring

- Application Insights integration
- Structured logging
- Error tracking and alerting

## 11. Timeline & Milestones

### Phase 1 (Day 0-1)

- Database schema design and implementation
- Entity Framework Core setup and migrations
- Initial data seeding
- Backend scaffold completion

### Phase 2 (Day 2-3)

- Azure AD authentication integration
- API endpoints implementation
- Frontend-backend integration
- Basic booking functionality

### Phase 3 (Day 4-5)

- Admin features implementation
- Testing & bug fixes
- PWA configuration
- Documentation & deployment

## 12. Success Metrics

### 12.1 Technical Metrics

- 99.9% system uptime
- < 1% error rate on bookings
- < 500ms average API response time

### 12.2 User Metrics

- 100% employee adoption
- < 30 seconds to complete a booking
- Zero double-bookings

## 13. Future Considerations

### 13.1 Potential Enhancements

- Multiple floor support
- Meeting room booking integration
- Resource booking (equipment, parking)
- Calendar integration
- Mobile app versions

### 13.2 Production Considerations

- UTC timezone handling
- Per-timeslot capacity management
- Advanced cancellation policies
- Waitlist functionality

## 14. Appendix

### A. Technical Stack

- Frontend: React, TypeScript, MSAL.js, Vite
- Backend: .NET 9, EF Core
- Database: Azure SQL
- Auth: Azure AD
- Hosting: Azure App Service/Container Apps

### B. Database Schema

Detailed schema available in project documentation.

### C. API Documentation

Full API specification available in Swagger/OpenAPI format.
