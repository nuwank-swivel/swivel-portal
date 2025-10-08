# Project Brief — Company Portal PWA (Seat Booking PoC)

Date: 2025-10-07

## Summary

Build a small Progressive Web App (PWA) used internally by all employees to access company tools. The initial tool is a seat-booking system for a single-floor office. Users authenticate with their Office 365 (Microsoft 365) accounts via Azure AD. Backend will be TypeScript Lambda functions hosted in AWS and the database will be MongoDB.

## Goals (PoC scope)

1. Login via Microsoft 365 (Azure AD) for all employees.
2. Dashboard listing tools; initial tool: Seat Booking.
3. Calendar view with future dates active only.
4. When a date is selected: show available seat count and a "Book a seat" button.
5. Booking modal supports booking duration: 1 hour, half-day, full-day and start/end times.
6. Admin users can modify seat count for a specific date from the same booking modal.
7. Store overrides (when a date's seat count differs from the default). Bookings always recorded.

## Assumptions

1. Only one office floor is in scope for the PoC.
2. Employee directory and authentication managed by Microsoft 365 / Azure AD.
3. Admins are defined by an Azure AD group or app role (recommended: AD group).
4. Frontend scaffold exists in `src/frontend/` (React + Vite). We'll add MSAL and PWA support.
5. Backend is a set of TypeScript Lambda functions in `src/backend/`; tokens are validated via Microsoft identity platform.

## High-level architecture

- Frontend: React (in `src/frontend/`), MSAL.js for Azure AD sign-in, PWA manifest + service worker.
- Backend: TypeScript Lambda functions hosted on AWS, using API Gateway. JWTs are validated via a Lambda authorizer or built-in API Gateway validation.
- Database: MongoDB. Stores bookings, per-day seat overrides, and minimal site configuration including the default seat count.
- Auth: Microsoft Entra ID (Azure AD) — app registration for SPA + Web API. Use group/role claims to identify admins.

## Contract (tiny)

Inputs:

- Auth: Office 365 user token (OIDC/OAuth2).
- Booking requests: date, startTime, endTime, durationType, optional seat override (admin).

Outputs:

- Available seat count per date.
- Booking creation / confirmation.
- Day override get/set.

Error modes:

- 401 Unauthorized when token missing/invalid.
- 403 Forbidden when admin-only actions attempted by non-admins.
- 409 Conflict when a booking would exceed available seats.

## API surface (initial)

All endpoints under `/api` and protected with JWT except public health/metadata.

GET /api/tools

- Returns an array of available tools for the dashboard (seeded with seat-booking).

GET /api/seatbooking/availability?date=YYYY-MM-DD

- Response: { date, defaultSeatCount, overrideSeatCount?, bookingsCount, availableSeats }

GET /api/seatbooking/bookings/me

- Returns current user's bookings.

POST /api/seatbooking/bookings

- Body: { date: YYYY-MM-DD, startTime: HH:mm, endTime: HH:mm, durationType: "hour"|"half-day"|"full-day" }
- Validates capacity, creates booking linked to user (sub/oid from token).

DELETE /api/seatbooking/bookings/{id}

- Cancel a booking (owner or admin).

GET /api/seatbooking/day-overrides?date=YYYY-MM-DD

- Returns override for date if exists.

PUT /api/seatbooking/day-overrides/{date}

- Admin only. Body: { seatCount }
- Creates/updates override for date. If seatCount equals default, the override may be removed.

GET /api/seatbooking/config

- Returns runtime configuration for seat booking (e.g., defaultSeatCount). Public to authenticated users.

PUT /api/seatbooking/config/default-seat-count

- Admin only. Body: { defaultSeatCount }
- Updates the global default seat count stored in DB.

## Database schema (initial) - MongoDB

Collections will be used to store the application data. Dates and times will be stored as ISO 8601 strings or BSON dates.

App configuration: for the PoC the default seat count will be stored in the database (see `SeatConfig` collection). Secrets and Azure AD configuration will be managed via AWS Secrets Manager.

**Users collection:**
```json
{
  "_id": "ObjectId",
  "oid": "string", 
  "email": "string",
  "displayName": "string",
  "isAdmin": "boolean",
  "lastSeen": "Date"
}
```

**SeatConfig collection (singleton):**
```json
{
  "_id": "ObjectId", 
  "defaultSeatCount": "number",
  "updatedBy": "string", 
  "updatedAt": "Date"
}
```

**DaySeatOverrides collection:**
```json
{
  "_id": "ObjectId",
  "date": "string", 
  "seatCount": "number",
  "updatedBy": "string", 
  "updatedAt": "Date"
}
```

**Bookings collection:**
```json
{
  "_id": "ObjectId",
  "userOid": "string",
  "date": "string", 
  "startTime": "string", 
  "endTime": "string", 
  "durationType": "string", 
  "createdAt": "Date",
  "canceledAt": "Date",
  "canceledBy": "string" 
}
```

Indexes: `Bookings(date)`, `Bookings(userOid)`.

## Seat count logic and storage rationale

- Persist the global default seat count in the database (`SeatConfig`) so administrators can change it without a config deploy.
- Persist a `DaySeatOverrides` row only when an admin changes the count for a specific date (when it differs from the stored default).

Pros:

- Admins can change defaults at runtime without redeploys.
- Clear hierarchy: per-date override wins; otherwise use DB default. Lightweight storage because we only store exceptions.

Cons:

- Slightly more DB reads (read SeatConfig then override). This is trivial and easily cached in-memory for short periods.

## Booking capacity enforcement

1. Read `SeatConfig.defaultSeatCount` (from DB, with in-memory cache if needed).
2. Read DaySeatOverrides for the date; if present, use its seatCount; otherwise use the default from SeatConfig.
3. Count active bookings for that date (exclude canceled bookings).
4. If bookingsCount >= seatCount => return 409 Conflict.

## Concurrency concerns

Risk: two concurrent booking requests for the last seat may race.
Mitigations:

1. Use a DB transaction with appropriate locking (serializable or UPDLOCK) when performing the read-and-insert.
2. Alternatively use optimistic retry for conflict errors. For PoC, implement a transaction-based guard and document production requirements.

## Auth and admin determination

- Register two app registrations in Azure AD: SPA (frontend) and Web API (backend). Expose API scopes.
- Frontend requests ID token + access token for the backend scope via MSAL.
- Backend uses Microsoft.Identity.Web or JWT Bearer middleware to validate tokens.

Admin detection options (choose one):

1. Azure AD Group membership (recommended): token or server-side Graph check.
2. Azure AD application roles and role claims.
3. Maintain admin mapping in DB (quick for PoC but extra source of truth).

Recommendation: Use Azure AD group for canonical truth and seed admin users in DB for initial testing.

## Frontend changes (React `frontend/`)

1. Add MSAL React and MSAL Browser for sign-in.
2. Protect routes and show Dashboard after login. Dashboard fetches `/api/tools` and shows seat-booking tile.
3. Seat Booking page:
   - Calendar component that disables past dates.
   - On date select: call /api/seatbooking/availability and show available seats and "Book a seat".
   - Booking modal: choose duration, start/end times, and confirm via POST /api/seatbooking/bookings.
   - Admin UI: show seat count field in the same modal if user is admin. When admin updates count, call PUT /api/seatbooking/day-overrides/{date}.
   - Admins can also update the global default via PUT /api/seatbooking/config/default-seat-count (accessible from an admin settings area or modal).
4. Make app a PWA: add manifest.json, icons, and register a service worker (Vite PWA plugin can be used).

## Backend (TypeScript) implementation notes

1. Using TypeScript with the Serverless Framework or AWS SAM for defining and deploying Lambda functions and API Gateway.
2. A Lambda authorizer will be used for validating Azure AD tokens.
3. Seed the `SeatConfig` collection on first run with a sensible default (e.g., 50) via a seeding script. Allow overriding via API.
4. Use Mongoose or a similar ODM for interacting with MongoDB.
5. For capacity operations, use transactions if using a replica set, or implement optimistic locking at the application level.
6. Each API endpoint will correspond to a Lambda function, following a single-responsibility principle.

## Telemetry and logging

- Use Amazon CloudWatch for structured logs and monitoring.

## Edge cases & open questions

1. Timezones — for PoC assume single timezone (office local) and store DATE/TIME in that zone. For production use UTC and convert in UI.
2. Granular timeslot capacity — PoC enforces day-level capacity. Per-timeslot enforcement is a future enhancement.
3. Cancellation rules and cutoffs are out of scope for PoC.

## Minimal deliverables for PoC

1. This project brief (docs/project-brief.md).
2. Frontend changes: MSAL + minimal dashboard + seat booking page + modal + PWA basics.
3. Backend scaffold: Serverless project with Lambda handlers, API Gateway configuration, and Azure AD validation wired for dev.
4. A script to seed the `SeatConfig` collection in MongoDB.
5. README with local setup steps for frontend and backend.

## Implementation plan & rough timeline (1 dev)

Day 0: Finalize requirements and admin list.
Day 1: Backend scaffold, Serverless/SAM configuration, MongoDB models, and dev Azure AD app registration docs.
Day 2: Frontend MSAL integration, dashboard, calendar UI connected to API.
Day 3: Booking flow, modal, validations, admin override endpoint and UI.
Day 4: Concurrency guard, basic tests/manual smoke, PWA manifest and service worker.
Day 5: Polish, README, deployment docs to AWS, handover.

## Quality gates

- Backend deploys successfully.
- Frontend builds; MSAL auth flow tested locally.
- Unit tests for booking capacity logic (happy path + conflict).
- Smoke test: sign-in with test Office 365 user, create booking, admin override.

## Next steps (choose one)

1. Create backend scaffold (Serverless/SAM project with Lambda handlers).
2. Add MSAL + dashboard + minimal booking UI to `frontend/` and PWA basics.
3. Implement both (1) and (2) — full PoC scaffold.
4. Ask clarifying questions first.

## Requirements coverage

- Office 365 login (Azure AD): Planned and described.
- Dashboard + seat booking workflow: Covered in API and frontend sections.
- Admin users and overrides: Covered and recommended Azure AD group approach.
- Seat count configurable and stored in DB and overrides only when different: Updated and documented.
- PoC focus on core functionality only: Plan scoped accordingly.