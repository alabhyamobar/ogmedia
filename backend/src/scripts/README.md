# Backend Scripts Layer (`backend/src/scripts/`)

## 1. Directory Overview & Architectural Role

The `scripts/` directory contains **operational CLI utilities and administrative provisioning tools** designed for one-time initialization, cluster migration, and DevOps automation.

### Primary Security Principle:
> *"Do not hardcode default administrators or seed credentials into Git repositories or production Dockerfiles."*

Shipping applications with default credentials like `admin / admin123` is one of the most common causes of corporate data breaches. The scripts in this directory allow administrators to provision the root cryptographic identity in an interactive, out-of-band manner.

---

## 2. File-by-File Technical Deep Dive

### `create-super-admin.js` — Out-of-Band Root Administrator Provisioning CLI

Invoked via:
```bash
npm run create-super-admin
```

#### Operational Workflow:
1. **Infrastructure Initialization**: Loads environment variables from `.env` and establishes a secure connection to MongoDB via `connectDB()`.
2. **Existing Admin Check**: Queries `User.findOne({ role: ROLES.SUPER_ADMIN })`. If an active Super Admin is already present, the script outputs a warning and exits cleanly without altering existing records.
3. **Interactive Secure CLI Prompts**: Uses Node.js `readline` to prompt the operator for:
   * Operator Name (e.g. `Rishi Admin`)
   * Username (e.g. `admin`)
   * Email (e.g. `admin@ogmedia.agency`)
   * Master Password (minimum 8 characters with strength validation)
4. **Credential Hashing & Permission Provisioning**:
   * Instantiates a new `User` document.
   * `role: ROLES.SUPER_ADMIN`
   * `status: 'ACTIVE'`
   * `mustChangePassword: false`
   * `expertise: Object.values(SERVICES)` (grants global visibility across all 8 agency verticals)
   * The Mongoose pre-save hook calculates a salted bcrypt hash (12 rounds).
5. **Audit Logging & Teardown**:
   * Automatically commits an `EMPLOYEE_CREATED` record to `AuditLog`.
   * Calls `disconnectDB()` and exits process cleanly with code `0`.

---

## 3. WHY Have We Done It This Way? (Engineering Rationale)

| Architectural Decision | Why It Was Done | Alternative Rejected & Risk |
| :--- | :--- | :--- |
| **Interactive Terminal CLI Tool** | Credentials are typed directly into the terminal during deployment and never committed to source control or logged to CI/CD artifacts. | **Hardcoding seed users in migration scripts**: Hardcoded passwords (`admin / admin`) get committed to GitHub, exposing production databases to immediate takeover. |
| **Pre-Existence Guard Check** | Prevents accidental overwrites or duplicate root accounts if the command is executed multiple times in production. | **Blindly creating duplicate admin accounts**: Generates duplicate key errors or creates unmonitored shadow admin accounts. |
| **Full Expertise Array (`Object.values(SERVICES)`)** | Guarantees that the Super Administrator is never locked out of viewing leads across any current or future agency service categories. | **Leaving expertise empty**: Restricts the Super Admin from viewing incoming leads if expertise scoping logic is strictly applied. |
| **Explicit `disconnectDB()` Cleanup** | Drains the Mongoose socket pool and terminates the Node.js event loop cleanly without leaving hanging process zombies. | **Forcing `process.exit(0)` immediately**: Can terminate the process while in-flight write buffers to MongoDB have not finished flushing. |
