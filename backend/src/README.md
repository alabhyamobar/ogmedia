# OG Media CRM — Backend Architecture & Engineering Masterclass

## 1. Master System Architecture Overview

The OG Media CRM backend is built from the ground up as a **high-throughput, distributed, failure-resilient ingestion and lead management engine**.

The core requirement of this architecture is **adaptive resilience**:
> **When Redis is configured and healthy, public submissions buffer through Redis Streams for peak throughput. If Redis is unavailable or unconfigured, the CRM seamlessly degrades to direct MongoDB persistence with zero downtime or rejected requests.**

Under massive viral traffic bursts (e.g. 1,000,000 inquiries submitted during an agency campaign), the Redis Streams ingestion buffer shields MongoDB. During maintenance or standalone single-node deployments without Redis, the CRM runs directly with MongoDB, guaranteeing 100% submission availability.

```text
                               PUBLIC TRAFFIC
                                     │
                                     ▼
                            ┌──────────────────┐
                            │   OG MEDIA WEB   │
                            │   Contact Form   │
                            └────────┬─────────┘
                                     │ POST /api/v1/public/leads
                                     ▼
                            ┌──────────────────┐
                            │  Express API     │
                            │  Node.js Layer   │
                            └────────┬─────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
                    ▼                                 ▼
         Distributed Rate Limit              Strict Zod Validation
         (Redis Store, 15/15m)               & Bot Honeypot Trap
                    │                                 │
                    └────────────────┬────────────────┘
                                     │
                                     ▼
                        5-Min Atomic Deduplication
                        (Redis SET ... EX 300 NX)
                                     │
                                     ▼
                        Redis Streams Buffer (XADD)
                        [ lead-submissions ]
                                     │
                                     ├──────────────────────────────┐
                                     │                              │
                                     ▼                              ▼
                         Fast Customer Ack (200 OK)       Asynchronous Worker
                         (Response in 10-30ms)            Consumer Group
                                                                    │
                                                                    ▼
                                                      Batch Aggregation (up to 50)
                                                                    │
                                                                    ▼
                                                      Controlled Concurrency (20)
                                                                    │
                                                                    ▼
                                                      MongoDB bulkWrite (Upsert)
                                                                    │
                                                                    ▼
                                                      PEL Recovery & Retries (DLQ)
                                                                    │
                                                                    ▼
                                                      CRM Analytics Invalidation
```

---

## 2. Root Entry Points: `app.js` & `server.js`

### `app.js` — The Express Application Factory (`createApp()`)

`app.js` encapsulates the HTTP middleware pipeline and route topology without binding to network sockets.

#### Key Engineering Decisions in `app.js`:
1. **Application Factory Pattern (`export function createApp()`)**:
   * Decouples the Express routing definition from the TCP HTTP server.
   * Enables automated integration test suites (Supertest) to instantiate isolated in-memory instances of the application without binding to real TCP ports.
2. **Reverse Proxy Trust (`app.set('trust proxy', 1)`)**:
   * Informs Express it is running behind an AWS ALB, Cloudflare, or NGINX reverse proxy.
   * Guarantees `req.ip` reflects the true client IP for rate limiting and audit logs rather than the load balancer's private IP.
3. **Helmet Security Headers**:
   * Enforces `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and strict referrer policies.
4. **CORS Defense**:
   * Uses an explicit whitelist (`FRONTEND_URL`) allowing only authorized domains with `credentials: true`. Wildcards (`*`) are prohibited.
5. **Payload Size Defense**:
   * Binds `express.json({ limit: '1mb' })` to reject multi-megabyte payloads that could trigger denial-of-service memory exhaustion.
6. **Centralized Error Boundary (`errorHandler`)**:
   * Normalizes all exceptions into consistent JSON error envelopes without leaking server stack traces in production.

---

### `server.js` — The Cluster Supervisor & Graceful Shutdown Coordinator

`server.js` is the operational entry point that manages network sockets, background threads, and infrastructure connectivity.

#### Startup Sequence:
1. **Durable Storage**: Connects to MongoDB connection pool (`await connectDB()`).
2. **Buffer Infrastructure**: Inspects Redis availability (`isRedisConfigured()`, `isRedisHealthy()`). If configured and healthy, provisions the stream consumer group (`await initLeadQueue()`). If unavailable or omitted, logs operational mode and smoothly initializes in Direct Database mode.
3. **HTTP Server**: Instantiates the Express app and binds to `PORT` (default: 4000).
4. **Worker Initialization**: Boots the background stream consumer pool (`startLeadWorker()`). In development, this runs in-process; in production clusters, workers can scale across dedicated worker containers.

#### Graceful Teardown Coordinator:
When receiving `SIGTERM` (from Kubernetes/Docker during deployment) or `SIGINT` (Ctrl+C):
```javascript
// 1. Stop polling loop so no new stream messages are consumed
stopLeadWorker();

// 2. Stop accepting new HTTP connections
server.close(async () => {
  // 3. Drain active MongoDB connection pool
  await disconnectDB();
  // 4. Close Redis TCP sockets cleanly
  await closeRedis();
  process.exit(0);
});
```
* Guarantees zero dropped requests or aborted database writes during rolling production updates.

---

## 3. Subfolder Architecture & In-Depth Guides

Click on any subfolder below to read its dedicated technical teaching guide, function breakdown, and architectural rationale:

| Subfolder | Role & Subsystem | Detailed Guide Link |
| :--- | :--- | :--- |
| **`config/`** | MongoDB connection pool governor and resilient ioredis client multiplexer | [config/README.md](file:///c:/Users/Rishi/OneDrive/Desktop/ogmedia/backend/src/config/README.md) |
| **`constants/`** | Single source of domain truth: roles, agency services, pipeline stages, and queue parameters | [constants/README.md](file:///c:/Users/Rishi/OneDrive/Desktop/ogmedia/backend/src/constants/README.md) |
| **`controllers/`** | Request orchestrators for public ingestion, authentication, leads, employees, analytics, and telemetry | [controllers/README.md](file:///c:/Users/Rishi/OneDrive/Desktop/ogmedia/backend/src/controllers/README.md) |
| **`middleware/`** | JWT authentication, RBAC, query-level expertise scoping, IDOR protection, and rate limiting | [middleware/README.md](file:///c:/Users/Rishi/OneDrive/Desktop/ogmedia/backend/src/middleware/README.md) |
| **`models/`** | Mongoose schemas with compound indexes, password security, and append-only audit immutability | [models/README.md](file:///c:/Users/Rishi/OneDrive/Desktop/ogmedia/backend/src/models/README.md) |
| **`queues/`** | Redis Streams management, stream ingestion (`XADD`), atomic deduplication, and DLQ routing | [queues/README.md](file:///c:/Users/Rishi/OneDrive/Desktop/ogmedia/backend/src/queues/README.md) |
| **`routes/`** | Domain-isolated REST routing modules with strict middleware chains | [routes/README.md](file:///c:/Users/Rishi/OneDrive/Desktop/ogmedia/backend/src/routes/README.md) |
| **`scripts/`** | Secure out-of-band CLI tools for provisioning the root Super Administrator | [scripts/README.md](file:///c:/Users/Rishi/OneDrive/Desktop/ogmedia/backend/src/scripts/README.md) |
| **`utils/`** | Zero-overhead Pino structured logging with automated secret redaction | [utils/README.md](file:///c:/Users/Rishi/OneDrive/Desktop/ogmedia/backend/src/utils/README.md) |
| **`validators/`** | Zod input sanitization, length bounding, regex constraints, and bot honeypot detection | [validators/README.md](file:///c:/Users/Rishi/OneDrive/Desktop/ogmedia/backend/src/validators/README.md) |
| **`workers/`** | Stream consumer pool with batching (`bulkWrite`), PEL crash recovery (`XCLAIM`), and retries | [workers/README.md](file:///c:/Users/Rishi/OneDrive/Desktop/ogmedia/backend/src/workers/README.md) |

---

## 4. Key Security & Architectural Principles Cheat Sheet

1. **Database Protection First**: Public traffic buffers into Redis Streams. MongoDB writes are strictly rate-governed by worker concurrency (`LEAD_WORKER_CONCURRENCY=20`).
2. **Never Filter in React / JavaScript**: Employee expertise filtering is baked directly into database queries via `{ service: { $in: user.expertise } }`.
3. **No Direct Object Referencing (IDOR)**: `requireLeadAccess` verifies employee authorization against the specific lead's service category on every `:id` route.
4. **Append-Only Auditing**: `AuditLogSchema` prohibits updates on existing documents at the database driver level.
5. **Zero Token Exposure**: Refresh tokens reside in `HttpOnly; Secure; SameSite=Strict` cookies, shielded from XSS script access.
6. **Graceful Degradation**: If Redis is offline, the system returns `503 Service Unavailable` rather than dumping unbuffered traffic directly into MongoDB.
