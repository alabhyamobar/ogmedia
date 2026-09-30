# Backend Routes Layer (`backend/src/routes/`)

## 1. Directory Overview & Architectural Role

The `routes/` directory defines the **HTTP routing topology, URL endpoints, and declarative middleware pipelines** of the OG Media CRM REST API.

Rather than defining giant monolithic route files, routing is decomposed into isolated, domain-specific modules. Each route module maps HTTP verbs (`GET`, `POST`, `PATCH`, `DELETE`) to a strictly sequenced chain of:
1. **Rate Limiting Middleware** (e.g. `publicLeadRateLimiter`, `loginRateLimiter`)
2. **Authentication Guards** (`authenticate`)
3. **Role-Based Access Control Guards** (`requireRole(...)`)
4. **Object-Level Authorization Middleware** (`requireLeadAccess`)
5. **Controller Execution Handler**

---

## 2. File-by-File Technical Deep Dive

### `publicLead.routes.js` — Public Gateway Routes
* **Endpoint**: `POST /api/v1/public/leads`
* **Middleware Chain**: `[ publicLeadRateLimiter, submitContactLead ]`
* **Purpose**: Allows unauthenticated public visitors on the OG Media website to submit inquiries. Protected by the strict 15-submission rate limiter and honeypot detection.

---

### `auth.routes.js` — Identity & Credential Management Routes
* **Endpoints**:
  * `POST /api/v1/auth/login`: `[ loginRateLimiter, login ]` — Rate-limited login endpoint.
  * `POST /api/v1/auth/logout`: `[ authenticate, logout ]` — Invalidates refresh session.
  * `POST /api/v1/auth/refresh`: `[ refreshToken ]` — Issues fresh access tokens using HTTP-only cookies.
  * `POST /api/v1/auth/change-password`: `[ authenticate, changePassword ]` — Forces self-service password updates.
  * `GET /api/v1/auth/me`: `[ authenticate, getCurrentUser ]` — Returns authenticated user profile.

---

### `lead.routes.js` — Core Sales Lead Pipeline Routes
* **Endpoints**:
  * `GET /api/v1/leads`: `[ authenticate, apiRateLimiter, getLeads ]` — Paginated leads scoped to user expertise.
  * `GET /api/v1/leads/:id`: `[ authenticate, requireLeadAccess, getLeadById ]` — Object-authorized single lead fetch.
  * `PATCH /api/v1/leads/:id`: `[ authenticate, requireLeadAccess, updateLead ]` — Whitelisted field updates.
  * `PATCH /api/v1/leads/:id/status`: `[ authenticate, requireLeadAccess, updateLeadStatus ]` — Lifecycle stage updates.
  * `POST /api/v1/leads/:id/notes`: `[ authenticate, requireLeadAccess, addLeadNote ]` — Append notes to lead timeline.
  * `PATCH /api/v1/leads/:id/assignment`: `[ authenticate, requireRole(SUPER_ADMIN, ADMIN), assignLead ]` — Administrative assignment to staff.

---

### `employee.routes.js` — Administrative Workforce Routes
* **Clearance**: All endpoints require `authenticate` + `requireRole(SUPER_ADMIN, ADMIN)`.
* **Endpoints**:
  * `GET /api/v1/employees`: Paginated staff directory.
  * `POST /api/v1/employees`: Creates employee, returns one-time temporary password.
  * `GET /api/v1/employees/:id`: Staff profile and caseload statistics.
  * `PATCH /api/v1/employees/:id`: Edits staff roles or expertise assignments.
  * `POST /api/v1/employees/:id/reset-password`: Resets credentials and sets `mustChangePassword`.
  * `PATCH /api/v1/employees/:id/status`: Enables or deactivates employee account.

---

### `analytics.routes.js` — Business Intelligence & Reporting Routes
* **Endpoints**:
  * `GET /api/v1/analytics/overview`: `[ authenticate, getOverviewAnalytics ]` — Conversion metrics and period comparison.
  * `GET /api/v1/analytics/services`: `[ authenticate, getServiceAnalytics ]` — Volume grouped by service category.
  * `GET /api/v1/analytics/employees`: `[ authenticate, requireRole(SUPER_ADMIN, ADMIN), getEmployeeAnalytics ]` — Sales velocity per staff member.

---

### `auditLog.routes.js` — Compliance & Security Audit Routes
* **Endpoint**: `GET /api/v1/audit-logs`
* **Clearance**: `[ authenticate, requireRole(SUPER_ADMIN, ADMIN), getAuditLogs ]`
* **Purpose**: Queryable, paginated event history for regulatory and internal security oversight.

---

### `system.routes.js` — Infrastructure Liveness & Observability Routes
* **Endpoints**:
  * `GET /health`: Public liveness probe.
  * `GET /health/ready`: Public readiness probe verifying MongoDB and Redis connection state.
  * `GET /api/v1/system/health`: `[ authenticate, requireRole(SUPER_ADMIN), getSystemHealthMetrics ]` — Deep operational telemetry (queue depth, worker lag, memory, pool size).

---

## 3. WHY Have We Done It This Way? (Engineering Rationale)

| Architectural Decision | Why It Was Done | Alternative Rejected & Risk |
| :--- | :--- | :--- |
| **Middleware Chaining Order (`auth` ➔ `role` ➔ `object`)** | Rejects unauthenticated requests before running database lookups, and rejects unauthorized roles before executing object queries. | **Checking permissions inside controller bodies**: Duplicates authorization logic across controllers and risks developer omission leading to security bugs. |
| **Separation of `/health` vs `/health/ready`** | Kubernetes and load balancers require `/health` (is the process alive?) and `/health/ready` (is the process ready to accept database traffic?). | **Single health endpoint**: If Redis restarts, killing the process rather than removing it from the load balancer pool causes unnecessary container crash-loops. |
| **Strict Subsystem Isolation** | Route modules match domain entities (`leads`, `employees`, `analytics`). | **Single massive `routes.js` file**: Becomes an unmaintainable 2,000-line merge conflict hotspot in team environments. |
| **Dedicated Rate Limiters Per Route** | Public endpoints require strict limits (15/15m) while authenticated operational staff require higher capacity (120/m). | **Global API rate limit**: Either starves employees trying to load dashboard pages or leaves the public contact form vulnerable to flooding. |
