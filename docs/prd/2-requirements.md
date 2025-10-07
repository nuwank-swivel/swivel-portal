# 2. Requirements

## 2.1 Core Features

### Authentication (To Be Implemented)

- Single Sign-On via Microsoft 365 (Azure AD)
- Role-based access control (Employee vs Admin)
- Secure token-based API authentication
- Login page with Microsoft authentication button
- Token management and refresh logic
- Protected route implementation

### Dashboard (Implemented)

- Clean, minimalist interface using ShadcnUI components
- Tools listing section with seat booking feature
- Responsive design supporting desktop and mobile devices
- Integration with authentication context needed

### Seat Booking System (Partially Implemented)

- Interactive calendar for date selection (Implemented)
- ShadcnUI modal for booking interface (Implemented)
- Real-time seat availability display (API integration pending)
- Flexible booking durations (1 hour, half-day, full-day) (UI implemented)
- User booking management (API integration pending)
- Admin capacity management (API integration pending)

## 2.2 Technical Requirements

### Frontend

- React + Vite application
- MSAL.js integration for Azure AD authentication
- PWA capabilities with offline support
- Responsive UI using modern components
- Real-time availability updates

### Backend

- .NET 9 Minimal API
- Azure AD token validation
- EF Core with SQL Server
- Transactional data integrity
- Caching for performance optimization

### Database

- Normalized schema for users, bookings, and configurations
- Efficient querying for availability checks
- Concurrency handling for booking conflicts
