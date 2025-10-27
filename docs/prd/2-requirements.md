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
- Lunch option selection during booking (UI implemented)
- User booking management (API integration pending)
- Admin capacity management (API integration pending)

### New Requirements (October 2025)

- **Recurring Bookings / Roaster Support:** Employees can set pre-defined days (e.g., every Monday and Thursday) for recurring seat bookings. These days are always booked for them automatically. Employees can still book extra days as needed.
- **Seat Layout Selection:** Users can view a visual seat layout for each date, select an available seat, and see their seat and other booked seats highlighted. The booking modal will store the selected seat.
- **Booking Updates:** Users can update their bookings, including changing or removing meal options.
- **Super Admin Role:** Super admin users are managed via Entra ID group, similar to admin users.
- **Meal Booking Settings:** Super admins can change meal booking settings and specify users to receive automated daily emails with meal booking details.
- **Team Management (Story 05.06)**

## 2.2 Technical Requirements

### Frontend

- React + Vite application
- MSAL.js integration for Azure AD authentication
- PWA capabilities with offline support
- Responsive UI using modern components
- Real-time availability updates

### Backend

- AWS Lambda with Node.js/TypeScript
- MongoDB Atlas
- Transactional data integrity
- Caching for performance optimization

### Database

- Normalized schema for users, bookings, and configurations
- Efficient querying for availability checks
- Concurrency handling for booking conflicts
