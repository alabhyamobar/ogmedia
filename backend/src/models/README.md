# Backend Models Layer (`backend/src/models/`)

## 1. Directory Overview & Architectural Role

The `models/` directory defines the **Mongoose document schemas, compound indexes, model lifecycle hooks, and validation constraints** for permanent data stored in MongoDB.

In this high-volume CRM architecture:
* MongoDB is the **permanent source of truth**.
* Redis is the **ingestion buffer and temporary persistence queue**.

The schemas here are designed to support rapid indexed queries, guarantee immutable security logging, protect against password leakage, and provide zero-duplicate idempotency guarantees when background workers drain the Redis queue.

---

## 2. File-by-File Technical Deep Dive

### `User.js` — Workforce Identity, RBAC & Authentication State

Defines the credentials, roles, and expertise privileges for system users.

#### Schema Properties:
* `name`: Staff member's display name.
* `username`: Unique, lowercase, indexed identifier.
* `email`: Unique, lowercase, indexed email.
* `passwordHash`: Salted bcrypt hash. **`select: false`** ensures that regular queries (`User.find()`, `User.findById()`) never serialize or return password hashes in API responses unless explicitly requested via `.select('+passwordHash')`.
* `role`: Enum matching `ROLES` (`SUPER_ADMIN`, `ADMIN`, `EMPLOYEE`).
* `expertise`: Array of `SERVICES` enums. Determines the lead visibility boundaries for employees.
* `status`: `'ACTIVE'` or `'INACTIVE'`. Enables immediate administrative revocation of system access.
* `mustChangePassword`: Boolean flag forcing newly created employees to reset their auto-generated temporary password upon initial login.
* `failedLoginAttempts`: Counter tracking sequential password failures.
* `lockUntil`: Timestamp tracking 15-minute brute-force lockout cooldowns.
* `lastLoginAt`: Timestamp of the most recent successful session.

#### Hooks & Methods:
* **Pre-Save Hash Hook**: Automatically computes `bcrypt.hash(this.passwordHash, 12)` if the password field is modified.
* **`comparePassword(candidatePassword)`**: Safely compares plaintext inputs against the stored hash in constant time.
* **`isLocked()`**: Computes whether the current time is earlier than `lockUntil`.

---

### `Lead.js` — Core Sales Lead Pipeline Entity

Stores customer inquiries ingested from the public website via Redis Streams.

#### Schema Properties:
* `eventId`: Unique UUID assigned at ingestion time. Backed by a **unique index** (`{ unique: true }`). This is the foundation of **worker idempotency**: if a worker restarts or network retry occurs, MongoDB rejects duplicate insertions.
* `name`, `email`, `phone`, `company`: Contact details.
* `service`: Agency vertical (`SERVICES` enum).
* `message`: Inquiry text submitted by the client.
* `status`: Pipeline stage (`LEAD_STATUS` enum, defaults to `'NEW'`).
* `assignedTo`: Reference to the assigned `User` ObjectId.
* `notes`: Embedded subdocument array tracking internal commentary, author attribution, and timestamps.
* `timeline`: Embedded audit trail tracking every status transition, who executed it, and when it occurred.
* `convertedAt`: Timestamp set automatically when status reaches `'CONVERTED'`.

#### Compound Indexes for Query Optimization:
```javascript
LeadSchema.index({ eventId: 1 }, { unique: true });
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ service: 1, createdAt: -1 });
LeadSchema.index({ status: 1, createdAt: -1 });
LeadSchema.index({ assignedTo: 1, createdAt: -1 });
```

---

### `AuditLog.js` — Append-Only Compliance & Security Trail

Records every security-sensitive action performed within the CRM.

#### Key Architectural Characteristic: **Guaranteed Immutability**
To comply with security and compliance standards, audit logs must never be altered or retroactively edited. `AuditLog.js` enforces this at the schema engine level:
```javascript
AuditLogSchema.pre('save', function () {
  if (!this.isNew) {
    throw new Error('AuditLog records are strictly append-only and cannot be modified.');
  }
});
```
Any attempt to execute `auditLog.save()` on an existing document throws a fatal runtime exception.

---

### `FailedLeadEvent.js` — MongoDB Dead Letter Queue (DLQ)

When an event in the Redis Stream fails processing after 5 sequential retries (due to corrupt payload, schema validation errors, or permanent exceptions), the worker moves the event to the `FailedLeadEvent` collection.

#### Schema Properties:
* `eventId`: Original submission correlation ID.
* `streamMessageId`: Redis stream sequence ID.
* `payload`: Complete raw JSON payload of the submission.
* `retryCount`: Number of failed attempts prior to abandonment.
* `errorReason`: Detailed stack trace or validation failure message.
* `resolved`: Boolean flag toggled when an administrator inspects and reprocesses the lead.

---

## 3. WHY Have We Done It This Way? (Engineering Rationale)

| Architectural Decision | Why It Was Done | Alternative Rejected & Risk |
| :--- | :--- | :--- |
| **`select: false` on `passwordHash`** | Prevents password hashes from accidentally leaking into JSON responses, API responses, or debug logs during normal queries. | **Default field selection**: A simple `res.json(user)` would transmit bcrypt hashes across the wire to frontend clients. |
| **Unique Index on `eventId`** | Guarantees distributed idempotency. Even if a background worker retries a batch or crashes halfway through processing, duplicate documents can never be created in MongoDB. | **No unique constraint on event ID**: Consumer crashes and retries produce duplicate lead records, skewing analytics and causing double-outreach. |
| **Compound Indexes (`service + createdAt`)** | Speeds up paginated queries for employee dashboards (`{ service: 'META_ADS' } sort by createdAt desc`) from full-collection scans (O(N)) to index b-tree lookups (O(log N)). | **Default `_id` index only**: As the database grows to hundreds of thousands of leads, dashboard queries begin timing out and overloading CPU. |
| **Schema-Enforced Immutability on `AuditLog`** | Prevents compromised admin accounts or rogue scripts from editing or erasing audit histories to cover unauthorized access. | **Mutable audit collection**: Malicious actors can tamper with audit timestamps or delete tracking records. |
| **Dead Letter Queue Collection (`FailedLeadEvent`)** | Guarantees **Zero Message Loss**. Corrupt or malformed messages are quarantined without halting the main ingestion stream. | **Silently dropping unprocessable events**: Customer queries containing typos or invalid formatting are permanently lost. |
