# Backend Configuration Layer (`backend/src/config/`)

## 1. Directory Overview & Architectural Role

The `config/` directory manages stateful network connections to the two primary infrastructure backbones of the OG Media CRM:
1. **MongoDB** (Permanent durable source-of-truth document store)
2. **Redis** (In-memory buffer, Redis Streams queue, rate limiter store, and analytics cache)

In a distributed, high-throughput system designed to withstand bursts of 1,000,000 submissions without crashing, **connection lifecycle management is critical**. A naive application opens connections haphazardly, crashes when a database restart occurs, or exhausts file descriptors and socket limits under burst traffic.

The files in this directory guarantee:
* **Managed Connection Pooling** (reusing sockets, bounding maximum open connections)
* **Automatic Reconnection & Exponential Backoff** (surviving network blips and cluster failovers)
* **Dedicated Client Isolation** (preventing blocking stream commands from stalling cache and rate limit operations)
* **Zero-Downtime Health Probing** (empowering readiness checks and circuit breakers)
* **Clean Graceful Shutdown** (draining active connections during SIGINT/SIGTERM without dropping in-flight writes)

---

## 2. File-by-File Technical Deep Dive

### `db.js` — MongoDB & Mongoose Lifecycle Governor

`db.js` coordinates the application's connection pool to MongoDB via Mongoose.

#### Key Functions & Implementation Details:

1. **`connectDB(uri, options)`**:
   * **Connection Re-use Guard**: Checks `if (isConnected && mongoose.connection.readyState === 1) return mongoose.connection;`. If the application process already holds an active, established connection, it avoids initiating redundant handshake sequences.
   * **Connection Pool Tuning**:
     ```javascript
     const defaultOptions = {
       maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '50', 10),
       minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || '10', 10),
       serverSelectionTimeoutMS: 5000,
       socketTimeoutMS: 45000,
       family: 4 // Force IPv4 to prevent Windows dual-stack IPv6 DNS resolution stalls
     };
     ```
   * **Lifecycle Event Listeners**:
     * `mongoose.connection.on('error', ...)`: Logs errors through structured logger and toggles `isConnected = false`.
     * `mongoose.connection.on('disconnected', ...)`: Logs warnings when connections drop and alerts downstream readiness probes.

2. **`disconnectDB()`**:
   * Evaluates `readyState !== 0`. If open, triggers `mongoose.disconnect()` and awaits graceful teardown.

3. **`isDbHealthy()`**:
   * Evaluates `mongoose.connection.readyState === 1` (`1 = connected`). Returns a fast boolean check utilized by `/health/ready` without issuing expensive ping queries to the database engine.

---

### `redis.js` — Resilient ioredis Factory & Client Multiplexer

`redis.js` manages connections to Redis for stream buffering, caching, rate limiting, and consumer worker loops.

#### Key Functions & Implementation Details:

1. **`getRedisClient()`**:
   * Returns a singleton `ioredis` instance for non-blocking commands (cache reads, pipeline rate checks, stream appends).
   * **`retryStrategy(times)`**: Calculates `Math.min(times * 100, 3000)`. If Redis becomes momentarily unreachable, it does not hammer the server with instant loops; it backs off incrementally up to 3 seconds.
   * **`reconnectOnError(err)`**: Intercepts `READONLY` errors (common in Redis Sentinel / AWS ElastiCache / Redis Cluster topology failovers when a replica promotes to master) and forces an automatic client reconnection to the newly promoted primary node.
   * **Masked Credential Logging**: `redisUrl.replace(/:[^:@]*@/, ':***@')` ensures passwords or cloud auth tokens in `REDIS_URL` are never leaked into log aggregators.

2. **`createDuplicateClient(options)`**:
   * Instantiates an isolated `new Redis()` connection configured with `maxRetriesPerRequest: null`.
   * **Why this is critical**: The background worker continuously calls `XREADGROUP ... BLOCK 2000`. In Redis protocol, a blocking command locks the entire socket until data arrives or the timeout elapses. If the shared API client ran `BLOCK`, all rate limiters, session lookups, and cache checks would freeze behind the blocking stream read! Creating a duplicate client dedicates a socket exclusively to the stream worker.

3. **`isRedisHealthy()`**:
   * Sends a lightweight `redisClient.ping()` and verifies `'PONG'`. Used by the public lead controller before accepting submissions.

4. **`closeRedis()`**:
   * Issues `redisClient.quit()` for a clean handshake disconnect.

---

## 3. WHY Have We Done It This Way? (Engineering Rationale)

| Architectural Decision | Why It Was Done | Alternative Rejected & Risk |
| :--- | :--- | :--- |
| **`maxPoolSize: 50`** | Enforces an upper limit on active MongoDB connections per Node process. In high concurrency, MongoDB processes each query in a dedicated thread/fiber. Unlimited connections cause context-switch thrashing and RAM exhaustion. | **Default unlimited connections**: Under a 10,000 req/sec burst, MongoDB crashes from connection starvation (`Too many open files`). |
| **Dedicated Duplicate Redis Client for Worker** | Redis is single-threaded per event loop, and TCP client sockets execute sequentially. The stream worker must block (`XREADGROUP ... BLOCK 2000`) waiting for incoming leads without stalling the Express API's rate-limiting or cache operations. | **Single shared Redis client**: The entire API freezes for 2000ms whenever the worker waits for stream messages. |
| **Circuit Breaker in `isRedisHealthy()`** | If Redis goes down, public submissions receive immediate `503 Service Unavailable` rather than falling back to direct MongoDB writes. | **Failing over to MongoDB**: If Redis fails under burst load, dumping traffic straight into MongoDB instantly destroys the database. |
| **IPv4 Forced (`family: 4`)** | On modern OS environments (Windows 10/11, macOS, Linux), `localhost` often resolves to `::1` before falling back to `127.0.0.1`, adding 1-2 seconds of latency per failed DNS lookup. | **System default DNS resolution**: Causes intermittent 2000ms connection timeouts on local dev and hybrid VPC environments. |
| **Masked URL Logging** | Cloud Redis connection strings often contain passwords (`redis://default:s3cr3t@aws.cache.com:6379`). We regex-mask credentials before logging. | **Raw URL logging**: Exposes infrastructure master passwords to Datadog/CloudWatch/Pino logs. |
