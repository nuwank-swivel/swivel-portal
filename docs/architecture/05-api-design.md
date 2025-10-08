# 6. API Design

## 6.1 RESTful Endpoints

```typescript
// Authentication
POST / api / auth / login; // Login with Azure AD token
GET / api / auth / me; // Get current user profile

// Tools
GET / api / tools; // List available tools

// Seat Booking
GET / api / seats / availability; // Get seat availability
GET / api / seats / bookings / me; // Get user's bookings
POST / api / seats / bookings; // Create booking
DELETE / api / seats / bookings / { id }; // Cancel booking

// Lunch Options
GET / api / lunch - options; // Get all lunch options
PUT / api / lunch - options; // Update all lunch options

// Admin Endpoints
GET / api / admin / seats / config; // Get seat configuration
PUT / api / admin / seats / config; // Update default seat count
PUT / api / admin / seats / override; // Set date override
```

## 6.2 API Response Format

```typescript
interface ApiResponse<T> {
  data: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}
```
