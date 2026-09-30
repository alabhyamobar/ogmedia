# OG Media Production CRM — API Reference

## Base URL
- Development: `http://localhost:4000`
- Production: Configured via reverse proxy / load balancer (e.g. `https://crm-api.ogmedia.agency`)

---

## 1. Response Formats

### Standard Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully.",
  "requestId": "4fa6e02d-6218-4a6c-94da-00a4d95ea237"
}
```

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not authorized to access leads in this service category.",
    "details": []
  },
  "requestId": "4fa6e02d-6218-4a6c-94da-00a4d95ea237"
}
```

---

## 2. Public Ingestion Endpoint

### Submit Contact Lead
`POST /api/v1/public/leads`

Enqueues customer submission into Redis Stream buffer. Returns immediate acknowledgement once accepted by Redis.

#### Request Headers
`Content-Type: application/json`

#### Request Body
```json
{
  "name": "Bruce Wayne",
  "email": "bruce@wayneenterprises.com",
  "phone": "+1-555-0199",
  "company": "Wayne Enterprises",
  "service": "META_ADS",
  "message": "We need hyper-targeted advertising campaigns.",
  "honeypot": ""
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Your query has been received.",
  "requestId": "b182cb05-...",
  "eventId": "b35c7546-..."
}
```

#### Service Degraded Response (`503 Service Unavailable`)
Returned if Redis is offline to protect MongoDB from unbuffered direct writes.
```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Our message ingestion system is undergoing brief maintenance. Please try again in a few moments."
  },
  "requestId": "..."
}
```

---

## 3. Authentication Endpoints

### Login
`POST /api/v1/auth/login`
- Body: `{ "login": "admin", "password": "AdminPass123!" }`
- Sets HTTP-only `refreshToken` cookie.
- Returns `{ accessToken, user }`.

### Logout
`POST /api/v1/auth/logout`
- Clears refresh token cookie and logs audit event.

### Refresh Token
`POST /api/v1/auth/refresh`
- Exchanges valid cookie refresh token for a new short-lived access token.

### Current User
`GET /api/v1/auth/me`
- Requires `Authorization: Bearer <token>`.
- Returns authenticated agent profile, role, and assigned expertise sectors.

### Change Password
`POST /api/v1/auth/change-password`
- Body: `{ "currentPassword": "...", "newPassword": "..." }`

---

## 4. Leads Endpoints

### List Leads (Paginated & Scoped)
`GET /api/v1/leads`
- Query Params:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 25, max: 100)
  - `search`: Filter by name, email, phone, company
  - `service`: Filter by sector (`META_ADS`, `SEO`, etc.)
  - `status`: Filter by pipeline status (`NEW`, `CONTACTED`, etc.)
  - `assignedTo`: Filter by employee ID or `UNASSIGNED`
- Enforces expertise isolation: Employees only receive leads within their assigned expertise sectors.

### Get Lead Details
`GET /api/v1/leads/:id`
- Returns lead with populated assignee, notes feed, and audit timeline.
- Enforces object-level authorization (returns 403 if lead service is outside employee expertise).

### Update Lead Customer Details
`PATCH /api/v1/leads/:id`
- Body: Whitelisted fields (`name`, `phone`, `company`, `message`).

### Update Lead Status
`PATCH /api/v1/leads/:id/status`
- Body: `{ "status": "CONTACTED", "note": "Call summary..." }`
- Records status change event in lead timeline and logs audit event.
- Invalidates Redis analytics cache.

### Add Internal Note
`POST /api/v1/leads/:id/notes`
- Body: `{ "text": "Client requested follow-up next Tuesday." }`

### Assign Lead (Admin Only)
`PATCH /api/v1/leads/:id/assignment`
- Body: `{ "employeeId": "6abb97b7..." }` (or `null` to unassign)
- Enforces that the employee's expertise includes the lead's service sector.

---

## 5. Employee Management Endpoints (Admin Only)

### List Team Roster
`GET /api/v1/employees?page=1&limit=20`

### Create Employee
`POST /api/v1/employees`
- Body:
```json
{
  "name": "Rahul Sharma",
  "username": "rahul",
  "email": "rahul@ogmedia.agency",
  "role": "EMPLOYEE",
  "expertise": ["META_ADS", "GOOGLE_ADS"],
  "temporaryPassword": "OptionalCustomPassword123!"
}
```
- Returns temporary password **once** in the creation response.

### Update Employee Role / Sectors / Status
`PATCH /api/v1/employees/:id`
- Body: `{ "expertise": ["META_ADS", "SEO"], "status": "INACTIVE" }`

### Reset Password
`POST /api/v1/employees/:id/reset-password`
- Generates a new temporary password and marks account for password change.

---

## 6. Analytics Endpoints

### Overview Analytics
`GET /api/v1/analytics/overview`
- Returns status counts, conversion rate `(Converted / Total) * 100`, and month-over-month comparison.
- Gracefully handles zero baseline: `"baselineNote": "No previous-period baseline"`.
- Results cached in Redis with TTL.

### Service Breakdown
`GET /api/v1/analytics/services`
- Returns lead counts and conversion win rates per service sector.

### Employee Leaderboard (Admin Only)
`GET /api/v1/analytics/employees`
- Returns assigned count, in-progress count, won retainers, and win rate per agent.

---

## 7. Audit & System Health

### Audit Logs (Admin Only)
`GET /api/v1/audit-logs?page=1&action=LEAD_STATUS_CHANGED`
- Immutable append-only log entries.

### Liveness Probe
`GET /health`
- Fast liveness check for container orchestrators.

### Readiness Probe
`GET /health/ready`
- Verifies MongoDB and Redis are connected and responsive.

### System & Queue Diagnostics (Super Admin Only)
`GET /api/v1/system/health`
- Live telemetry: Redis Stream length, Pending entries (PEL), DLQ length, memory usage, MongoDB status.
