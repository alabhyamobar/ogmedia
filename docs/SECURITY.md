# OG Media Production CRM — Security Specification

## 1. Security Architecture Principles

Security is integrated into every layer of the CRM. The system operates on **Zero Trust**, **Least Privilege**, and **Defense-in-Depth**.

---

## 2. Authentication & Session Management

### 2.1 Token Strategy
- **Short-Lived Access Tokens**: Signed using HMAC-SHA256 (`JWT_SECRET`) with a 15-minute expiration.
- **Secure Refresh Mechanism**: 7-day refresh tokens stored in **HTTP-only, Secure, SameSite** cookies to protect against Cross-Site Scripting (XSS) extraction.
- **Immediate Invalidation**: When an employee is deactivated (`status === 'INACTIVE'`), the authentication middleware immediately rejects requests, terminating active sessions upon next token verification.

### 2.2 Password Security & Hashing
- Passwords hashed using **bcrypt** with a salt round factor of 12 (or Argon2id).
- Passwords and token secrets are explicitly excluded from default queries via Mongoose `select: false`.
- **First Admin Initialization**: Production credentials are never hardcoded. Initial Super Admin is provisioned via the secure CLI script `npm run create-super-admin`.
- **Temporary Password Handling**: Generated temporary passwords are displayed **only once** to the creating administrator and never logged.

### 2.3 Brute-Force & Account Lockout Defense
- `/api/v1/auth/login` is guarded by strict rate limiting (5 attempts per 15 minutes per IP).
- Account lockout: 5 consecutive failed login attempts trigger a 15-minute account lock (`lockUntil`).
- **Generic Error Messages**: Responses return generic messages ("Invalid username or password") to prevent user enumeration attacks.

---

## 3. Role-Based Access Control & Expertise Isolation

### 3.1 Role Hierarchy
| Role | Capabilities |
|---|---|
| **SUPER_ADMIN** | Full global access: manage employees, assign roles, view all leads, inspect queue diagnostics, access immutable audit logs. |
| **ADMIN** | Operational manager: assign leads within permitted sectors, view team performance analytics, manage employee status. |
| **EMPLOYEE** | Operational specialist: view, follow up, add notes, and advance statuses **only** for leads matching their assigned `expertise` array. |

### 3.2 Database-Level Expertise Isolation (No React-Side Filtering)
**Critical Rule**: The application **never** queries all leads and filters by employee expertise in React. Instead, the backend authorization layer injects query filters directly into MongoDB:
```javascript
export function buildLeadScopeFilter(user, additionalFilters = {}) {
  const filter = { ...additionalFilters };
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return filter;

  // Strict database query injection
  filter.service = { $in: user.expertise || [] };
  return filter;
}
```
If an employee attempts to query an unauthorized sector (e.g. Rahul with `[META_ADS]` queries `service=SEO`), the filter resolves to `{ service: { $in: [] } }`, returning zero records.

### 3.3 Object-Level Authorization (IDOR / BOLA Prevention)
Direct resource endpoints (`/api/v1/leads/:id`, `/status`, `/notes`, `/assignment`) execute the `requireLeadAccess` middleware:
1. Resolves the target lead by ID from MongoDB.
2. If role is `EMPLOYEE`, checks whether `user.expertise.includes(lead.service)`.
3. If not, immediately aborts with **HTTP 403 Forbidden** and logs the security violation to the audit trail.
4. Lead assignment also enforces expertise: administrators cannot assign an employee to a lead outside their declared expertise.

---

## 4. Input Validation, Bot Protection & Injection Defense

### 4.1 Input Validation (Zod)
Every external payload is validated against strict Zod schemas:
- Validates data types, character bounds (e.g. name ≤ 120 chars, message ≤ 5000 chars), and canonical service enumerations.

### 4.2 Bot Trap (Honeypot Field)
Public contact forms include an invisible honeypot field (`honeypot`). Automated bots scanning the DOM and populating all inputs are trapped:
- If `honeypot` is non-empty, the API logs the bot IP and returns a benign HTTP 200 without queueing the request to Redis or processing it.

### 4.3 Mass Assignment Protection
Controllers explicitly whitelist permitted fields rather than passing `req.body` to Mongoose update methods:
```javascript
const allowedFields = ['name', 'phone', 'company', 'message'];
// Discards malicious fields like role, passwordHash, status, permissions
```

### 4.4 MongoDB Query Injection Protection
User-provided search queries are sanitized and escaped against regex and Mongo query operators (`$where`, `$gt`, etc.) before being bound to queries.

---

## 5. Security Headers, CORS & Audit Logging

### 5.1 Helmet & CORS
- **Helmet**: Disables MIME-type sniffing (`X-Content-Type-Options: nosniff`), enforces `X-Frame-Options`, and removes `X-Powered-By`.
- **CORS**: Restricted strictly to authorized frontend origins (`FRONTEND_URL`), disallowing wildcard `*` with credentials.

### 5.2 Immutable Audit Trail
Sensitive administrative actions (`LOGIN`, `LOGIN_FAILED`, `EMPLOYEE_CREATED`, `EMPLOYEE_DISABLED`, `PASSWORD_RESET`, `LEAD_STATUS_CHANGED`, `EMPLOYEE_EXPERTISE_CHANGED`) write immutable records to the `AuditLog` collection.
- Logs are append-only; update and delete operations on the model are blocked at the schema level.
- Credentials, tokens, and database passwords are automatically redacted.
