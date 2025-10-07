# 5. Technical Architecture

## 5.1 Frontend Architecture

### Current Implementation

- React 18+ with TypeScript
- Vite build system
- ShadcnUI component library
- Calendar and modal components
- Basic routing setup

### To Be Implemented

- MSAL React for authentication
- Protected routes wrapper
- PWA manifest and service worker
- API integration layer
- Error handling and loading states

## 5.2 Backend Architecture

- ASP.NET Core Minimal API
- Azure AD integration
- EF Core with SQL Server
- RESTful API endpoints
- Structured logging with Serilog

## 5.3 Database Design

- Users table for profile data
- SeatConfig for global settings
- DaySeatOverrides for capacity management
- Bookings for reservation tracking
