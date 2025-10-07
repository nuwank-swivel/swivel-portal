# Project Brief — Company Portal PWA (Seat Booking PoC)

Date: 2025-10-07

## Summary

Build a small Progressive Web App (PWA) used internally by all employees to access company tools. The initial tool is a seat-booking system for a single-floor office. Users authenticate with their Office 365 (Microsoft 365) accounts via Azure AD. Backend will be a .NET Core Web API hosted in Azure and the database will be Azure SQL.

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
5. Backend is a .NET 9 Minimal API in `src/backend/`; tokens are validated via Microsoft identity platform.

## High-level architecture

- Frontend: React (in `src/frontend/`), MSAL.js for Azure AD sign-in, PWA manifest + service worker.
- Backend: ASP.NET Core Minimal API (in `src/backend/`), hosted in Azure App Service or Container Apps, JWT Bearer validating Azure AD tokens.
- Database: Azure SQL. Stores bookings, per-day seat overrides, and minimal site configuration including the default seat count.
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

## Database schema (initial)

Use simple normalized schema. All dates stored as DATE; times as TIME.

App configuration: for the PoC the default seat count will be stored in the database (see `SeatConfig` below). Secrets and Azure AD configuration remain in `appsettings` / Key Vault.

CREATE TABLE Users (
id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
oid NVARCHAR(100) NOT NULL UNIQUE, -- object id from Azure AD
email NVARCHAR(256),
displayName NVARCHAR(256),
isAdmin BIT DEFAULT 0,
lastSeen DATETIME2
);

CREATE TABLE SeatConfig (
id INT PRIMARY KEY CHECK (id = 1), -- single-row table, id = 1
default_seat_count INT NOT NULL,
updated_by UNIQUEIDENTIFIER NULL,
updated_at DATETIME2 DEFAULT SYSUTCDATETIME()
);

CREATE TABLE DaySeatOverrides (
date DATE PRIMARY KEY,
seat_count INT NOT NULL,
updated_by UNIQUEIDENTIFIER NULL,
updated_at DATETIME2 DEFAULT SYSUTCDATETIME()
);

CREATE TABLE Bookings (
id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
user_id UNIQUEIDENTIFIER NULL,
user_oid NVARCHAR(100) NOT NULL,
date DATE NOT NULL,
start_time TIME NOT NULL,
end_time TIME NOT NULL,
duration_type NVARCHAR(20) NOT NULL,
created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
canceled_at DATETIME2 NULL,
canceled_by UNIQUEIDENTIFIER NULL
);

Indexes: Bookings(date), Bookings(user_id).

## Seat count logic and storage rationale

- Persist the global default seat count in the database (`SeatConfig`) so administrators can change it without a config deploy.
- Persist a `DaySeatOverrides` row only when an admin changes the count for a specific date (when it differs from the stored default).

Pros:

- Admins can change defaults at runtime without redeploys.
- Clear hierarchy: per-date override wins; otherwise use DB default. Lightweight storage because we only store exceptions.

Cons:

- Slightly more DB reads (read SeatConfig then override). This is trivial and easily cached in-memory for short periods.

## Booking capacity enforcement

1. Read `SeatConfig.default_seat_count` (from DB, with in-memory cache if needed).
2. Read DaySeatOverrides for the date; if present, use its seat_count; otherwise use the default from SeatConfig.
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

## Backend (.NET) implementation notes

1. Using .NET 9 with ASP.NET Core Minimal API approach in `src/backend/`.
2. Use Microsoft.Identity.Web for Azure AD token validation.
3. Seed the `SeatConfig` table on first run with a sensible default (e.g., 50) via EF Core migrations or startup code. Allow overriding via API.
4. Use EF Core (Code First) for PoC. Add migrations for the tables above.
5. For capacity operations, use transactions and locking as noted in concurrency section.
6. Group API endpoints by feature using extension methods to maintain clean Program.cs.

## Telemetry and logging

- Add structured logs (Serilog) and Application Insights for Azure.

## Edge cases & open questions

1. Timezones — for PoC assume single timezone (office local) and store DATE/TIME in that zone. For production use UTC and convert in UI.
2. Granular timeslot capacity — PoC enforces day-level capacity. Per-timeslot enforcement is a future enhancement.
3. Cancellation rules and cutoffs are out of scope for PoC.

## Minimal deliverables for PoC

1. This project brief (docs/project-brief.md).
2. Frontend changes: MSAL + minimal dashboard + seat booking page + modal + PWA basics.
3. Backend scaffold: Web API with endpoints, EF Core models, migrations, Azure AD validation wired for dev.
4. SQL migration scripts for the initial schema (including seeding `SeatConfig`).
5. README with local setup steps for frontend and backend.

## Implementation plan & rough timeline (1 dev)

Day 0: Finalize requirements and admin list.
Day 1: Backend scaffold, EF Core models, migrations, and dev Azure AD app registration docs.
Day 2: Frontend MSAL integration, dashboard, calendar UI connected to API.
Day 3: Booking flow, modal, validations, admin override endpoint and UI.
Day 4: Concurrency guard, basic tests/manual smoke, PWA manifest and service worker.
Day 5: Polish, README, deployment docs to Azure, handover.

## Quality gates

- Backend builds and migrations run.
- Frontend builds; MSAL auth flow tested locally.
- Unit tests for booking capacity logic (happy path + conflict).
- Smoke test: sign-in with test Office 365 user, create booking, admin override.

## Next steps (choose one)

1. Create backend scaffold (Web API + EF models + migrations).
2. Add MSAL + dashboard + minimal booking UI to `frontend/` and PWA basics.
3. Implement both (1) and (2) — full PoC scaffold.
4. Ask clarifying questions first.

## Requirements coverage

- Office 365 login (Azure AD): Planned and described.
- Dashboard + seat booking workflow: Covered in API and frontend sections.
- Admin users and overrides: Covered and recommended Azure AD group approach.
- Seat count configurable and stored in DB and overrides only when different: Updated and documented.
- PoC focus on core functionality only: Plan scoped accordingly.
