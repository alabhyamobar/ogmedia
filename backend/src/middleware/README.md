# Backend Middleware Layer (`backend/src/middleware/`)

## 1. Directory Overview & Architectural Role

The `middleware/` directory forms the **security perimeter, observability pipeline, and error handling boundary** of the Express API.

Every incoming HTTP request traverses these middleware interceptors before reaching controller business logic. The middleware layer is designed to:
* Verify cryptographic identity and extract session context
* Enforce **Role-Based Access Control (RBAC)** and **Expertise-Based Lead Isolation**
* Block Insecure Direct Object References (**IDOR / BOLA**)
* Mitigate Distributed Denial of Service (DDoS) and brute-force attacks via Redis-backed distributed rate limiters
* Inject correlation Request IDs and structured observability logs
* Sanitize and format all runtime exceptions without leaking infrastructure internals

---

## 2. File-by-File Technical Deep Dive

### `auth.js` — Security Context & Authorization Engine

`auth.js` implements the four pillars of the CRM access control system.

#### 1. `authenticate(req, res, next)`:
* **Dual-Token Discovery**: Inspects `Authorization: Bearer <token>` header first; falls back to the secure `accessToken` cookie.
* **Cryptographic Verification**: Validates the JWT signature against `JWT_SECRET`.
* **Database State Validation**: Queries MongoDB (`User.findById(decoded.userId).select('+status')`).
  * **Why query the database?** A stateless JWT remains mathematically valid until expiration. If an administrator deactivates an employee (`status = 'INACTIVE'`), relying purely on stateless JWT checks would allow the fired employee to continue reading customer queries until the token expires! Checking active status closes this security loophole immediately.
* Attaches `req.user` for downstream controllers.

#### 2. `requireRole(...allowedRoles)`:
* Declarative route guard. Example: `requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN)`.
* Rejects unauthorized requests with a standard `403 FORBIDDEN` error.

#### 3. `buildLeadScopeFilter(user, additionalFilters)`:
* **The Heart of Expertise Isolation**:
  ```javascript
  if (user.role === ROLES.SUPER_ADMIN || user.role === ROLES.ADMIN) {
    return filter;
  }
  const allowedServices = user.expertise || [];
  if (allowedServices.length === 0) {
    filter.service = { $in: [] }; // Cannot view any leads
    return filter;
  }
  filter.service = { $in: allowedServices };
  ```
* Enforces lead isolation at the **MongoDB query level**. It is impossible for an employee to craft an API request that fetches leads outside their domain.

#### 4. `requireLeadAccess(req, res, next)`:
* **Object-Level Authorization (IDOR Defense)**:
  * Intercepts routes targeting specific lead IDs (e.g. `GET /api/v1/leads/:id`, `PATCH /api/v1/leads/:id/status`).
  * Loads the lead from MongoDB.
  * Verifies whether `req.user.expertise.includes(lead.service)`.
  * If an employee tries to access an unauthorized lead by guessing or enumerating IDs in the URL bar, the request is blocked with `403 FORBIDDEN` and an IDOR security warning is written to the audit log.
  * Attaches `req.lead = lead` so the controller does not need to query the database a second time.

---

### `rateLimiter.js` — Distributed Redis-Backed Request Governors

Uses `express-rate-limit` coupled with `rate-limit-redis`.

* **Why Redis-backed rate limiting?**
  In a horizontally scaled environment with 3 or more Express API instances behind a load balancer, in-memory rate limiting fails because an attacker can cycle between nodes. Storing counters in Redis ensures global rate enforcement across all server nodes.

* **Configured Governors**:
  1. **`publicLeadRateLimiter`**: 15 submissions per 15 minutes per IP. Thwarts lead spam, bot submissions, and submission flood bursts.
  2. **`loginRateLimiter`**: 5 attempts per 15 minutes per IP (50 in development). Thwarts brute-force credential stuffing.
  3. **`apiRateLimiter`**: 120 requests per minute per IP for authenticated API consumption.

---

### `errorHandler.js` — Centralized Exception Normalizer

Captures all exceptions passed to `next(error)` and guarantees standard JSON error contracts:

* **Zod Error**: Returns `400 VALIDATION_ERROR` with structured field-by-field validation details.
* **Mongoose `CastError`**: Intercepts invalid MongoDB ObjectId strings (e.g. `/leads/not-an-id`) and returns `400 INVALID_ID`.
* **MongoDB Code 11000**: Intercepts duplicate key violations (e.g. duplicate username or email) and returns `409 CONFLICT`.
* **JWT Errors**: Distinguishes between `TokenExpiredError` (`401 TOKEN_EXPIRED`) and `JsonWebTokenError` (`401 INVALID_TOKEN`).
* **Production Stack Sanitization**: Never leaks internal code traces, file paths, or database errors to the client in production.

---

### `requestLogger.js` — Correlation ID & Telemetry Interceptor

* Generates or propagates an `X-Request-Id` UUID for every request.
* Hooks into `res.on('finish', ...)` to calculate request duration in milliseconds.
* Emits structured JSON log lines containing `requestId`, `method`, `url`, `statusCode`, `duration`, `ip`, and authenticated `userId`.
* Automatically redacts sensitive fields like passwords, tokens, and authorization headers.

---

## 3. WHY Have We Done It This Way? (Engineering Rationale)

| Architectural Decision | Why It Was Done | Alternative Rejected & Risk |
| :--- | :--- | :--- |
| **Object-Level Authorization Middleware (`requireLeadAccess`)** | Prevents Broken Object-Level Authorization (BOLA / IDOR — OWASP API #1). An authenticated user must be verified against the specific record they are attempting to view or mutate. | **Role-only checking**: An employee with role `EMPLOYEE` could view competitor leads by simply modifying the lead ID in the browser URL bar. |
| **Database Query-Level Scoping (`buildLeadScopeFilter`)** | Scopes data directly inside MongoDB using `{ service: { $in: user.expertise } }`. | **Fetching all leads and filtering in JavaScript**: Consumes massive database bandwidth, strains Node.js RAM, and risks accidental leakage in response payloads. |
| **Redis Store for Rate Limiters** | Enforces rate limits across all distributed Express instances simultaneously using shared Redis keys. | **In-memory rate limiters**: An attacker sending 1,000 requests spread across 5 load-balanced API servers would never trigger single-process limits. |
| **Active Status Check on Every Authenticated Request** | Instantly revokes system access the second an administrator deactivates an employee. | **Relying solely on stateless JWT expiry**: A terminated employee with a valid 15-minute token could download leads or alter client statuses before the token naturally expired. |
