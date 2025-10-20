# Company Portal PWA - Technical Architecture Documentation

This directory contains the technical architecture documentation for the Company Portal PWA project.

## Table of Contents

0. [System Overview](00-overview.md)
1. [Technical Stack](01-technical-stack.md)
2. [Key Technical Decisions](02-key-decisions.md)
3. [Security Architecture](03-security.md)
4. [Database Design](04-database.md)
5. [API Design](05-api-design.md)
6. [Development Workflow](06-development.md)
7. [Performance Optimization](07-performance.md)
8. [Monitoring and Logging](08-monitoring.md)
9. [Deployment Architecture](09-deployment.md)
10. [Testing Strategy](10-testing.md)
11. [Documentation](11-documentation.md)
12. [Future Considerations](12-future.md)
13. [Risk Mitigation](13-risks.md)
14. [Success Metrics](14-metrics.md)

**Project**: Company Portal PWA (Seat Booking PoC)
**Date**: 2025-10-20 (updated)
**Status**: In Progress
**Author**: Architecture Team

---

## October 2025 Requirements Update

The following new requirements have been incorporated:

- Recurring bookings / roster support
- Visual seat layout and seat selection
- Booking updates (including meal options)
- Super admin role (Entra ID group)
  // ...existing code...
- Meal booking settings and notifications

**Architecture Update Checklist:**

- [x] Update database schema for recurring bookings (roster days per user)
- [x] Add seat layout model and seat assignment logic
- [x] Support booking updates (including meal options)
- [x] Add super admin role and permissions (Entra ID group integration)
- [x] Add meal booking settings and notification logic
- [x] Update API endpoints and backend logic for all above
- [x] Update technical architecture and diagrams as needed
