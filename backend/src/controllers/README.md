# Backend Controllers Layer (`backend/src/controllers/`)

## 1. Directory Overview & Architectural Role

The `controllers/` directory houses the HTTP request orchestrators for all REST endpoints in the OG Media CRM. 

Controllers bridge the external HTTP interface (Express routes, headers, body, cookies) with internal domain services, MongoDB models, Redis Stream queues, and security authorization contexts.

### Fundamental Architectural Rules Enforced in Controllers:
1. **Never write synchronously to MongoDB on public endpoints**: Public leads are validated and committed to Redis Streams; the client receives a fast 200 acknowledgement with an `eventId`.
2. **Never filter records in memory or on the frontend**: Authorization and expertise scoping are injected directly into MongoDB queries.
3. **Mass-Assignment Immunity**: No controller uses `Model.create(req.body)` or `findByIdAndUpdate(id, req.body)`. All incoming payloads are whitelisted field-by-field.
4. **Audit Immutability**: Every mutation (status changes, employee creations, password resets, role changes) triggers an append-only `AuditLog` entry.
5. **No Information Leakage**: Authentication errors use generic responses to prevent user enumeration.

---

## 2. File-by-File Technical Deep Dive

### `publicLead.controller.js` — Public Ingestion & Traffic Buffer Gateway

Handles `POST /api/v1/public/leads`.

* **Execution Pipeline**:
  1. **Schema Validation**: Validates payload via `contactLeadSchema.parse(req.body)`.
  2. **Bot Honeypot Defense**: Checks the hidden `honeypot` field. If populated by an automated bot script, it logs a warning and returns a benign `200 OK` without enqueuing anything into Redis or MongoDB.
  3. **Circuit-Breaker Protection**: Calls `isRedisHealthy()`. If Redis is offline, it logs the incident and returns **`503 Service Unavailable`**. It **never** falls back to direct MongoDB writes, preserving database survivability during infrastructure outages.
  4. **Idempotency Window**: Calls `checkAndSetDuplicate(email, phone, service)`. If a duplicate submission arrives within 5 minutes, it returns a 200 acknowledgement without enqueueing duplicate work.
  5. **Stream Ingestion**: Calls `enqueueLeadSubmission()`, executing an atomic `XADD` to `lead-submissions`.
  6. **Fast Acknowledgement**: Returns `{ success: true, message: "Your query has been received.", eventId, requestId }` within 10-30ms.

---

### `auth.controller.js` — Authentication & Session Lifecycle Controller

Handles credential verification, JWT issuance, token rotation, and password management.

* **Functions**:
  * `login`: 
    * Sanitizes login input (username or email).
    * Enforces **account lockout** checks (`lockUntil`).
    * Verifies password using `user.comparePassword(password)`.
    * Implements failed login tracking: increments `failedLoginAttempts`. After 5 consecutive failures, locks the account for 15 minutes.
    * Generates a short-lived Access Token (15m) and a long-lived Refresh Token (7d).
    * Sets the Refresh Token inside an **`HttpOnly; Secure; SameSite=Strict`** cookie.
    * Writes `LOGIN` or `LOGIN_FAILED` to the `AuditLog`.
  * `refreshToken`: Reads the HTTP-only cookie, verifies the refresh signature, verifies the user remains active in MongoDB, and issues a fresh Access Token.
  * `logout`: Clears the HTTP-only cookie and creates a `LOGOUT` audit record.
  * `getCurrentUser`: Returns the sanitized identity of `req.user`.
  * `changePassword`: Verifies existing password, hashes new password via bcrypt (12 rounds) or Argon2id, clears `mustChangePassword`, and records `PASSWORD_RESET`.

---

### `lead.controller.js` — Lead Lifecycle & Expertise Enforcement Controller

Handles all protected lead operations.

* **Functions**:
  * `getLeads`:
    * Calls `buildLeadScopeFilter(req.user, queryFilter)` to guarantee employees only see leads within their assigned expertise.
    * Supports regex search over `name`, `email`, `phone`, `company` with regex escaping to prevent ReDoS injection attacks.
    * Enforces strict pagination (`limit` capped at 100).
  * `getLeadById`: Fetches lead document attached to `req.lead` by the `requireLeadAccess` authorization middleware.
  * `updateLead`: Whitelists update fields (`phone`, `company`, `message`, `source`). Rejects unauthorized field tampering.
  * `updateLeadStatus`:
    * Validates status against `LEAD_STATUS` enum.
    * If status is `CONVERTED`, stamps `convertedAt = new Date()`.
    * Invalidate Redis analytics cache keys (`analytics:*`) so dashboard conversion metrics update instantly.
    * Records `LEAD_STATUS_CHANGED` in `AuditLog`.
  * `addLeadNote`: Appends a timestamped note object to the lead's `notes` array with the author's ID and name.
  * `assignLead`:
    * Validates that the target employee exists, is `ACTIVE`, and **possesses the matching expertise** for the lead's service.
    * Updates `assignedTo` and records `LEAD_ASSIGNED`.

---

### `employee.controller.js` — Administrative Workforce Management

Handles staff account creation, role assignments, and expertise matrix configuration.

* **Functions**:
  * `getEmployees`: Paginated list of staff members with role and status filters. Excludes password hashes.
  * `createEmployee`:
    * Verifies uniqueness of username and email.
    * Generates a cryptographically strong temporary password (`crypto.randomBytes(6)`).
    * Sets `mustChangePassword: true` so the employee must choose their own password upon first login.
    * Returns the generated credentials **only once** in the response.
    * Records `EMPLOYEE_CREATED` in `AuditLog`.
  * `updateEmployee`: Updates name, role, and expertise array. Records `EMPLOYEE_EXPERTISE_CHANGED`.
  * `updateEmployeeStatus`: Toggles `ACTIVE` / `INACTIVE`. When an employee is disabled, all subsequent API calls return `403 ACCOUNT_DISABLED`.
  * `resetEmployeePassword`: Generates a new temporary password, hashes it, sets `mustChangePassword: true`, and logs `PASSWORD_RESET`.

---

### `analytics.controller.js` — High-Speed Cached Conversion Metrics

Provides executive business intelligence and sales velocity data.

* **Functions**:
  * `getOverviewAnalytics`:
    * Checks Redis cache key `analytics:overview:<period>:<scope>`.
    * On cache miss, executes a high-performance MongoDB aggregation pipeline calculating total leads, stage breakdown, and conversion rates.
    * **Period Comparison & Zero-Baseline Handling**: Compares the selected date range against the identical previous period. If the baseline previous conversions are 0, it displays `"No previous-period baseline"` rather than dividing by zero or outputting invalid `NaN%`.
    * Stores calculation in Redis with a 15-minute TTL.
  * `getServiceAnalytics`: Aggregates lead volume and conversion performance grouped by agency service category.
  * `getEmployeeAnalytics`: Evaluates sales velocity, closed conversions, and active pipelines per employee.

---

### `auditLog.controller.js` — Security & Compliance Telemetry

Handles `GET /api/v1/audit-logs`.

* Restricted to `SUPER_ADMIN` and `ADMIN`.
* Implements paginated, filterable queries across actor, action type, and date range.
* Reads from the append-only `AuditLog` collection.

---

### `system.controller.js` — Infrastructure Health & Queue Depth Probes

* `getHealth`: Basic liveness check returning uptime and process memory.
* `getReadiness`: Evaluates both `isDbHealthy()` and `isRedisHealthy()`. If either system is degraded, returns `503 Service Unavailable`. Used by Kubernetes / Docker load balancers to route traffic.
* `getSystemHealthMetrics`: Super Admin observability dashboard:
  * Redis stream depth (`XLEN lead-submissions`)
  * Worker consumer group lag and Pending Entries List (PEL) count
  * Dead Letter Queue (`lead-submissions-dlq`) count
  * Active MongoDB connection pool size

---

## 3. WHY Have We Done It This Way? (Engineering Rationale)

| Architectural Decision | Why It Was Done | Alternative Rejected & Risk |
| :--- | :--- | :--- |
| **Honeypot Field in `publicLead`** | Catches 99% of automated web scraping bots and spam crawlers with 0ms overhead, without forcing legitimate human clients to solve frustrating CAPTCHAs. | **Aggressive CAPTCHA on all users**: Slashes contact form conversion rates by 20-30%. |
| **Account Lockout on Failed Logins** | Locks accounts for 15 minutes after 5 failed attempts. Completely neutralizes automated credential-stuffing and brute-force dictionary attacks. | **Unlimited login attempts**: Attackers run automated password dictionaries at 1,000 attempts/sec until accounts are cracked. |
| **Query-Level Scoping in `getLeads`** | Injects `{ service: { $in: user.expertise } }` directly into the database query. Unauthorized records never leave the MongoDB server. | **Filtering in Node.js / React**: Exposes competitor and client leads in network responses; vulnerable to DevTools inspection or query tampering. |
| **Redis Invalidation on Lead Status Update** | Deleting affected `analytics:*` cache keys on status mutation guarantees the dashboard never shows stale business statistics. | **Fixed TTL caching alone**: Managers change lead status to CONVERTED but the dashboard shows outdated conversion figures for 15 minutes. |
| **Strict Parameter Whitelisting** | Explicitly defines which object keys can be updated. | **`Model.update(req.body)`**: Malicious users can send `{ role: 'SUPER_ADMIN', status: 'CONVERTED' }` and escalate privileges. |
