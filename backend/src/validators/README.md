# Backend Validators Layer (`backend/src/validators/`)

## 1. Directory Overview & Architectural Role

The `validators/` directory implements the **input validation perimeter** of the OG Media CRM using **Zod**.

### Core Application Security Rule:
> *"Never trust client-side validation. Every external input must be strictly verified for type, length, format, allowed values, and maximum payload size before processing."*

Relying on frontend validation or basic if-checks leaves an API vulnerable to NoSQL injection, buffer overflow/payload exhaustion, prototype pollution, and malformed data corruption.

---

## 2. File-by-File Technical Deep Dive

### `index.js` — Declarative Zod Schemas & Transformation Pipelines

#### Key Exported Schemas:

1. **`contactLeadSchema` — Public Submission Contract**:
   * `name`: String, trimmed, 2 to 100 characters.
   * `email`: String, trimmed, lowercase, RFC 5322 email syntax validation.
   * `phone`: String, trimmed, international phone pattern validation (`/^[+]?[0-9\s-()]{7,20}$/`).
   * `company`: String, trimmed, maximum 100 characters (optional).
   * **`service` (Intelligent Transformation)**:
     * Accepts either standard enum tokens (`'META_ADS'`) OR frontend marketing labels (`'Meta Ads & Paid Media'`).
     * Uses Zod `.transform()` via `LABEL_TO_SERVICE` to sanitize marketing copy into clean database enum keys before reaching controllers.
   * `message`: String, trimmed, 5 to 2,000 characters. Prevents submission of multi-megabyte payloads that could exhaust server memory.
   * `honeypot`: String, optional. Silent anti-bot field that legitimate human users never see.

2. **`loginSchema` — Authentication Input Validator**:
   * `login`: String, trimmed, 3 to 100 characters. Accepts either username or email.
   * `password`: String, 6 to 100 characters.

3. **`createEmployeeSchema` — Workforce Provisioning Validator**:
   * `name`: String, 2 to 100 characters.
   * `username`: Regex `/^[a-zA-Z0-9_]{3,30}$/`. Restricts usernames to alphanumeric characters and underscores, completely preventing URL path traversal and shell injection risks.
   * `email`: Standard email validation.
   * `role`: Enum `[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EMPLOYEE]`.
   * `expertise`: Array of `SERVICES` enums. Ensures staff can only be granted valid service domains.

4. **`updateLeadStatusSchema`**:
   * `status`: Validates against `LEAD_STATUS` enum.
   * `note`: Optional comment (max 500 characters) explaining the status transition.

5. **`changePasswordSchema`**:
   * `currentPassword`: Required string.
   * `newPassword`: Enforces minimum 8 characters with strength requirements.

---

## 3. WHY Have We Done It This Way? (Engineering Rationale)

| Architectural Decision | Why It Was Done | Alternative Rejected & Risk |
| :--- | :--- | :--- |
| **Strict Type & Length Bounding** | Restricts all string inputs to safe maximum lengths (e.g. `message` max 2,000 chars). | **Unbounded inputs**: Attackers submit 50MB strings in the contact form, consuming memory and triggering Node.js heap out-of-memory crashes. |
| **Zod Transformation (`LABEL_TO_SERVICE`)** | Automatically converts friendly frontend dropdown labels into internal system enums in the validation pass. | **Manual controller switch-statements**: Creates spaghetti code across controllers and risks unhandled label variations. |
| **Alphanumeric Username Regex (`^[a-zA-Z0-9_]+$`)** | Prevents special characters, slashes, null bytes, or spaces in usernames. | **Freeform string usernames**: Vulnerable to directory traversal, LDAP injection, or broken routing when username appears in URLs. |
| **Automated Schema Stripping** | Zod automatically strips unmodeled keys from the validated object. | **Allowing arbitrary JSON attributes**: Attackers pass unexpected attributes (e.g. `__proto__`, `role: 'ADMIN'`) causing mass-assignment or prototype pollution. |
