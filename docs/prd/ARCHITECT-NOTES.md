# Architect Notes – October 2025 Requirements

## Summary of New Requirements

1. **Recurring Bookings / Roaster Support**: Employees can set recurring days for automatic seat bookings (e.g., every Monday/Thursday). Still able to book extra days.
2. **Seat Layout Selection**: Visual seat layout for each date; users select seats, see their seat and others highlighted. Store selected seat in booking.
3. **Booking Updates**: Users can update bookings, including meal options.
4. **Super Admin Role**: Managed via Entra ID group, similar to admin users.
5. **Team Management**: Super admins can create teams, assign managers/leads/members. Managers/leads can manage teams and book for the team.
6. **Meal Booking Settings**: Super admins can configure meal options and set up automated daily meal booking emails for selected users.

## Architecture Update Checklist

- [x] Update database schema for recurring bookings (roaster days per user)
- [x] Add seat layout model and seat assignment logic
- [x] Support booking updates (including meal options)
- [x] Add super admin role and permissions (Entra ID group integration)
- [x] Add meal booking settings and notification logic
- [x] Update API endpoints and backend logic for all above
- [x] Update technical architecture and diagrams as needed

**Please review all relevant architecture docs and update as appropriate.**
