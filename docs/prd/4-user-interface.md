# 4. User Interface

## 4.1 Navigation

- Simple top navigation bar
- Dashboard as home page
- Tools section with seat booking tile

## 4.2 Booking Flow

1. Select date from calendar
2. View available seats and seat layout for the selected date
3. Click on an available seat in the layout to select it (my seat and booked seats are highlighted)
4. Click "Book a seat" or confirm recurring booking (if setting up a roaster)
5. Choose duration, time, and meal options
6. Confirm booking
7. Receive confirmation
8. Optionally, update or remove meal options for existing bookings

## 4.3 Admin Interface

- Integrated seat count management in booking panel
- Default seat count configuration in settings
- Override management for specific dates
- Super admin panel for managing super admins (via Entra ID group)
- Meal booking settings: super admins can configure meal options and set up automated daily meal booking emails for selected users

## 4.4 Availability Management

### User Dashboard

- "Availability" section is visible on the dashboard for all users.
- Users see "Signin" and "AFK" buttons:
  - "Signin" starts the day, records signin time, and changes to "Signoff."
  - "AFK" allows users to set an ETA (default 1 hour, customizable), changes to "Back" when active.
  - "Back" resets presence/status.
  - "Signoff" ends the day and records signoff time.
- Display current status and times for each event.

### Admin Dashboard

- "Availability" button and date selector to view records for all users.
- Can view today’s and historical availability records.
