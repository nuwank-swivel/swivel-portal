# 6. API Design

## 6.1 RESTful Endpoints (Updated October 2025)

### Booking Model

All bookings (single and recurring) are stored in the same collection. Recurring bookings use a `type: "recurring"` field and a `dayOfWeek` property. Per-date overrides (e.g., meal option changes, skips) are stored in an `overrides` array within the booking record.

Sample booking record:

```json
{
  "_id": "ObjectId(...)",
  "userId": "emp_123",
  "seatId": "seat_A12",
  "type": "recurring", // or "single"
  "dayOfWeek": 1, // 0=Sunday, 1=Monday, etc. (for recurring)
  "date": "2025-10-20", // for single booking
  "createdAt": "2025-10-15T09:00:00Z",
  "mealOption": "veg", // default meal for recurring or single
  "overrides": [
    {
      "date": "2025-10-27T00:00:00Z",
      "mealOption": "fish"
    },
    {
      "date": "2025-11-03T00:00:00Z",
      "mealOption": null // no meal that day
    }
  ]
}
```

When checking seat availability, both single bookings and recurring bookings with matching `dayOfWeek` (and any overrides for specific dates) are considered.

#### Endpoints

```typescript
// Authentication
POST /api/auth/login; // Login with Azure AD token
GET /api/auth/me; // Get current user profile

// Tools
GET /api/tools; // List available tools

// Seat Booking
GET /api/seats/availability; // Get seat availability
GET /api/seats/layout; // Get seat layout
GET /api/seats/bookings/me; // Get user's bookings
POST /api/seats/bookings; // Create booking (single or recurring)
PUT /api/seats/bookings/:id; // Update booking (seat, meal, etc.)
DELETE /api/seats/bookings/:id; // Cancel booking

// ...existing code...

// Lunch/Meal Options
GET /api/lunch-options; // Get all lunch options
PUT /api/lunch-options; // Update all lunch options (super admin)

// Meal Booking Settings
GET /api/lunch-settings; // Get meal booking settings (super admin)
PUT /api/lunch-settings; // Update meal booking settings (super admin)

// Admin Endpoints
GET /api/admin/seats/config; // Get seat configuration
PUT /api/admin/seats/config; // Update default seat count
PUT /api/admin/seats/override; // Set date override

// Super Admin
GET /api/admin/super-admins; // List super admins (Entra ID group)
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
