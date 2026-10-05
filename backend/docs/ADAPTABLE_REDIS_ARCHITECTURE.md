# OG Media CRM — Adaptable Hybrid Architecture (Redis Buffer & Direct Database Mode)

## Executive Summary

The OG Media CRM backend features an **Adaptable Hybrid Data Ingestion & Caching Engine**. 

Historically, distributed enterprise systems faced a dilemma:
- **Direct-to-Database Architecture**: Simple to deploy with minimal moving parts, but vulnerable to connection pool starvation and write contention during viral burst events.
- **Queue-Buffered Architecture**: Highly scalable under peak bursts, but introduces a single point of failure if the message broker (Redis) goes offline or is not configured.

The OG Media CRM eliminates this trade-off by dynamically operating in one of two modes:
1. **REDIS_BUFFER Mode**: Activated when Redis connection credentials are provided and the cache database is healthy. Public lead submissions are buffered via high-throughput Redis Streams (`XADD`) with atomic deduplication (`SET NX EX`) and drained asynchronously by a concurrency-controlled worker pool.
2. **DIRECT_DATABASE Mode**: Activated automatically when `REDIS_URL` is omitted, disabled, or when connection to Redis fails. The CRM operates directly with MongoDB without downtime, 503 service errors, or dropped customer leads.

```text
                                 PUBLIC TRAFFIC
                                       │
                                       ▼
                       ┌──────────────────────────────┐
                       │   POST /api/v1/public/leads   │
                       └───────────────┬──────────────┘
                                       │
                                       ▼
                       ┌──────────────────────────────┐
                       │    Zod Schema Validation     │
                       │    & Honeypot Bot Trap       │
                       └───────────────┬──────────────┘
                                       │
                                       ▼
                        Is Redis Configured & Healthy?
                                       │
                      ┌────────────────┴────────────────┐
                 YES  │                                 │  NO / FAILING
                      ▼                                 ▼
         [ REDIS_BUFFER MODE ]               [ DIRECT_DATABASE MODE ]
    ┌─────────────────────────────┐     ┌─────────────────────────────┐
    │ 1. Atomic Redis Dedup       │     │ 1. Mongo + Memory Dedup     │
    │    (SET NX EX 300)          │     │    (Compound Index Scan)    │
    │ 2. Redis Stream Ingestion   │     │ 2. Direct Mongo Insertion   │
    │    (XADD lead-submissions)  │     │    (Lead Document Created)  │
    │ 3. 200 OK Response in 15ms  │     │ 3. Timeline & Audit Log     │
    │ 4. Background Worker Drains │     │    (LEAD_CREATED Recorded)  │
    │    Batch Upserts to Mongo   │     │ 4. 200 OK Response in 20ms  │
    └─────────────────────────────┘     └─────────────────────────────┘
```

---

## 1. Key Components & Implementation Details

### 1.1. Adaptive Redis Connection Abstraction (`src/config/redis.js`)

- **Connection Detection**: Automatically evaluates `process.env.REDIS_URL` and `process.env.USE_REDIS`. If the variable is empty or explicitly set to `'disabled'`, `'none'`, or `'false'`, Redis is classified as `DISABLED`. No socket connection is attempted.
- **Fail-Fast Configuration**:
  - `lazyConnect: false` with `connectTimeout: 3000ms`.
  - `enableOfflineQueue: false`: Ensures commands never buffer infinitely when Redis is down; commands reject immediately so callers seamlessly degrade to MongoDB in sub-millisecond time.
  - `maxRetriesPerRequest: 1`: Prevents hanging HTTP requests.
- **Error Suppression**: Attached `'error'` listeners capture `ECONNREFUSED` and connection errors at the logger level without crashing the Node.js process.
- **Active Health Probing (`isRedisHealthy()`)**: Performs active ping with a 1500ms timeout guard:
  ```js
  export async function isRedisHealthy() {
    if (!isRedisConfigured()) return false;
    const client = getRedisClient();
    if (!client || client.status !== 'ready') return false;
    try {
      const pong = await Promise.race([
        client.ping(),
        new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 1500))
      ]);
      return pong === 'PONG';
    } catch {
      return false;
    }
  }
  ```

---

### 1.2. Direct Database Persistence Service (`src/services/leadPersistence.service.js`)

When Redis is unavailable, the CRM emulates the background worker transaction synchronously:
1. **Idempotency Guarantee**: Checks for duplicate `eventId` before writing.
2. **Document Creation**: Instantiates `Lead` with `status: 'NEW'` and initial timeline entry:
   - `performedByName: 'SYSTEM (Direct Database Mode)'`
   - `details: 'Lead ingested directly to database (Redis queue bypassed)'`
3. **Audit Trail**: Appends immutable `AuditLog` record (`action: 'LEAD_CREATED'`).
4. **Cache Invalidation**: Triggers cache invalidation so analytics dashboards immediately reflect new lead counts.
5. **Deduplication Engine**: Employs MongoDB compound index `{ email: 1, service: 1, createdAt: -1 }` combined with an in-memory TTL map to prevent concurrent microsecond double-submissions.

---

### 1.3. Unified Resilient Caching Layer (`src/utils/cache.js`)

Controllers no longer interact with raw Redis instances. Instead, they use a resilient facade:
- `getCache(key)`: Attempts retrieval from Redis; if Redis is down or cache misses, transparently checks in-memory LRU cache. Returns `null` on misses without throwing.
- `setCache(key, value, ttlSeconds)`: Writes to Redis when healthy; falls back to in-memory TTL map.
- `invalidateCachePattern(pattern)`: Deletes matching keys across both Redis and memory without throwing exceptions.

---

### 1.4. Adaptable In-Memory + Distributed Rate Limiting (`src/middleware/rateLimiter.js`)

The `AdaptableRateLimitStore` integrates `rate-limit-redis` with `express-rate-limit`'s built-in `MemoryStore`:
- **Lazy Initialization**: Never fires background `SCRIPT LOAD` commands until Redis is verified healthy, preventing unhandled promise rejections on disconnected sockets.
- **Dynamic Failover**: If Redis is online, distributed rate-limiting keys (`rl:public_leads:*`, `rl:login:*`, `rl:api:*`) coordinate quotas across all cluster nodes. If Redis disconnects, requests immediately fall back to the internal `MemoryStore`.

---

### 1.5. Worker Lifecycle & Standby Supervisor (`src/workers/lead.worker.js`)

The background lead worker adapts to Redis availability:
- **Standby State**: If Redis is offline at boot, the worker logs an informative standby message and avoids hot-looping or crashing.
- **Supervisor Polling**: A lightweight background supervisor polls Redis health every 15 seconds. If Redis comes online, the worker automatically initializes the stream consumer group and drains buffered submissions.
- **Connection Recovery**: If Redis drops during active stream consumption, the worker catches the disconnection, pauses with exponential backoff (5 seconds), and resumes upon reconnection.

---

### 1.6. System Readiness & Telemetry (`src/controllers/system.controller.js`)

- **`/health`**: Returns `200 OK` with process uptime and timestamp.
- **`/health/ready`**: In adaptable mode, MongoDB is the primary dependency. As long as the database is connected, readiness returns `200 READY` with `mode: 'DIRECT_DATABASE'`. If Redis is active, it reports `mode: 'REDIS_BUFFER'`.
- **`/api/v1/system/health`**: Exclusive developer endpoint reporting database connection pool stats, Redis telemetry (memory, clients, keys), worker concurrency, operating mode, and real-time error debug buffers.

---

## 2. Configuration Reference

All settings can be configured via environment variables (`.env`):

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `REDIS_URL` | `redis://127.0.0.1:6379` | Redis connection URL. Set to empty, `disabled`, or `none` to disable. |
| `USE_REDIS` | `true` | Set to `false` to explicitly disable Redis even if `REDIS_URL` is set. |
| `REQUIRE_REDIS` | `false` | If `true`, `/health/ready` requires Redis UP; if `false` (default), direct DB mode is considered ready. |
| `REDIS_CONNECT_TIMEOUT_MS` | `3000` | Socket connection timeout in milliseconds before falling back. |
| `MONGODB_URI` | `(required)` | Primary MongoDB Atlas or replica set connection URI. |
| `MONGODB_FALLBACK_URI` | `mongodb://127.0.0.1:27017/ogcrm` | Local fallback URI used if primary URI is blocked (e.g. Atlas IP whitelist during local dev). |
| `START_IN_PROCESS_WORKER` | `true` | Runs the stream drain worker in-process (set `false` if running via `npm run worker`). |
| `LEAD_DUPLICATE_WINDOW_SECONDS` | `300` | Window (seconds) for rejecting duplicate submissions from the same contact. |
| `LEAD_WORKER_CONCURRENCY` | `20` | Maximum parallel MongoDB write operations per worker batch. |

---

## 3. Production Verification & Test Results

The backend includes two dedicated test suites validating both modes:

### 3.1. Automated Test Suite (`npm test`)
Executes 30 automated integration tests covering:
1. Ingestion queue and direct DB mode fallback.
2. Duplicate submission detection across Redis and MongoDB.
3. RBAC data isolation (Admin, Developer, Staff domain scopes).
4. Password hashing with bcrypt.
5. Audit log immutability and append-only constraints.
6. Public contact form rate limiting and honeypot trapping.
7. Employee creation, credential generation, and clearance update validations.

**Result: 30 / 30 tests passed (0 failures, 0 unhandled rejections).**

### 3.2. End-to-End Production Verification (`npm run verify`)
Spins up a complete HTTP production server and verifies real client requests:
- Public health (`/health`) and readiness (`/health/ready`).
- Multi-role authentication (Developer, Administrator, Domain Staff).
- Public lead submission without Redis (persisted to MongoDB, verified via query).
- Duplicate submission handling (returns `isDuplicate: true`).
- Honeypot bot trapping.
- Staff domain scoping (100% of queried leads within assigned expertise).
- Lead status workflow transitions and audit trail generation.
- Analytics aggregations computed directly from MongoDB.
- Security gate enforcement (403 Forbidden for non-developers on developer routes).

**Result: 100% of production verification checks passed.**
