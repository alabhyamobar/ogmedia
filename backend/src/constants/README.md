# Backend Constants Layer (`backend/src/constants/`)

## 1. Directory Overview & Architectural Role

The `constants/` directory establishes the **single source of domain truth** for all enums, system states, operational parameters, and queue configurations across the OG Media CRM.

In an enterprise CRM that integrates public websites, Redis Streams, worker pools, role-based security boundaries, and audit loggers, **hardcoding magic strings across files is an anti-pattern**. A single typo (such as `'META-ADS'` instead of `'META_ADS'` or `'CONVERT'` instead of `'CONVERTED'`) results in silent permission leaks, broken MongoDB queries, or lost leads.

---

## 2. File-by-File Technical Deep Dive

### `index.js` — Domain Entities, Enums & Queue Configuration

#### Exported Enumerations & Data Structures:

1. **`ROLES`**:
   ```javascript
   export const ROLES = {
     SUPER_ADMIN: 'SUPER_ADMIN',
     ADMIN: 'ADMIN',
     EMPLOYEE: 'EMPLOYEE'
   };
   ```
   * **`SUPER_ADMIN`**: Full platform authority (manages admins, audit logs, queue telemetry, system health).
   * **`ADMIN`**: Operational lead management, employee assignment, analytics inspection.
   * **`EMPLOYEE`**: Strictly confined to leads matching their explicitly assigned `expertise` array.

2. **`SERVICES`**:
   * Contains the 8 agency service verticals: `META_ADS`, `GOOGLE_ADS`, `SEO`, `WEB_DEVELOPMENT`, `SOCIAL_MEDIA`, `CONTENT_MARKETING`, `GRAPHIC_DESIGN`, `GENERAL`.
   * Serves as the strict validation enum for incoming contact queries and the basis of the **Expertise-Based Access Control** security model.

3. **`SERVICE_LABELS` & `LABEL_TO_SERVICE`**:
   * Provides bidirectional translation between human-readable marketing titles (e.g. `"3D Web & App Design"`, `"Meme Culture & Viral Content"`) and database enum keys (`"WEB_DEVELOPMENT"`, `"CONTENT_MARKETING"`).
   * Allows the public website marketing copy to evolve without migrating database schemas or altering API contract constants.

4. **`LEAD_STATUS`**:
   * Defines the 8 stages of the sales lifecycle pipeline:
     `NEW` ➔ `CONTACTED` ➔ `QUALIFIED` ➔ `PROPOSAL` ➔ `NEGOTIATION` ➔ `CONVERTED` (or terminal stages `LOST`, `CLOSED`).
   * Every transition triggers an append-only `AuditLog` entry.

5. **`AUDIT_ACTIONS`**:
   * Explicit enumeration of all trackable security and operational events:
     `LOGIN`, `LOGOUT`, `LOGIN_FAILED`, `EMPLOYEE_CREATED`, `EMPLOYEE_DISABLED`, `EMPLOYEE_ENABLED`, `PASSWORD_RESET`, `LEAD_CREATED`, `LEAD_ASSIGNED`, `LEAD_UPDATED`, `LEAD_STATUS_CHANGED`, `EMPLOYEE_EXPERTISE_CHANGED`.

6. **`QUEUE_CONFIG`**:
   ```javascript
   export const QUEUE_CONFIG = {
     STREAM_NAME: 'lead-submissions',
     CONSUMER_GROUP: 'crm-lead-consumers',
     DLQ_STREAM_NAME: 'lead-submissions-dlq',
     DEFAULT_BATCH_SIZE: 50,
     MAX_RETRIES: 5,
     DUPLICATE_WINDOW_SECONDS: 300
   };
   ```

---

## 3. WHY Have We Done It This Way? (Engineering Rationale)

| Architectural Decision | Why It Was Done | Alternative Rejected & Risk |
| :--- | :--- | :--- |
| **Centralized Enum Registry** | Guarantees that Zod validators, Mongoose models, Express middleware, worker processors, and test suites reference the exact same identifiers. | **Scattered string literals**: Typos like `'ADMINISTRATOR'` vs `'ADMIN'` result in catastrophic authorization bypasses or orphaned records. |
| **Bidirectional Label Mapping (`LABEL_TO_SERVICE`)** | The public website's marketing department may rename "Paid Ads" to "Meta Ads & Paid Media". The database engine and worker must keep stable, immutable enum keys (`META_ADS`). | **Binding DB schemas directly to marketing labels**: Schema migrations would be required every time a copywriter changes the contact form labels. |
| **`DUPLICATE_WINDOW_SECONDS: 300`** | Enforces a 5-minute idempotency window per `email + phone + service`. Prevents rapid double-clicks, frantic resubmissions, or form bot loops from creating duplicate pipeline records. | **Rejecting duplicates permanently**: Legitimate clients who return weeks later for another service would be blocked from submitting. |
| **`MAX_RETRIES: 5` with DLQ Stream** | If MongoDB suffers transient connection stalls or write conflicts, the worker retries up to 5 times with exponential backoff before offloading to `lead-submissions-dlq`. | **Infinite retries or immediate drops**: Infinite retries create a "poison pill" blocking the queue; dropping causes silent loss of customer leads. |
| **`DEFAULT_BATCH_SIZE: 50`** | Tuned to saturate MongoDB's bulkWrite pipeline without exceeding transaction limits or event loop latency thresholds. | **Batch size of 1**: Generates 1,000,000 separate TCP roundtrips to MongoDB, destroying database throughput. |
