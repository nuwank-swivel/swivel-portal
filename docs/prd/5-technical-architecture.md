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

- AWS Lambda with TypeScript
- Amazon API Gateway for RESTful endpoints
- Azure AD integration for authentication
- Mongoose for MongoDB data access
- Structured logging with Amazon CloudWatch

## 5.3 Database Design

- MongoDB hosted on MongoDB Atlas
- `users` collection for profile data
- `seatConfigurations` for global settings
- `daySeatOverrides` for capacity management
- `bookings` for reservation tracking
