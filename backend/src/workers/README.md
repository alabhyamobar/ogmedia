# Backend Workers Layer (`backend/src/workers/`)

## 1. Directory Overview & Architectural Role

The `workers/` directory implements the **asynchronous write governor and distributed stream consumer pool** for the OG Media CRM.

In this architecture, public contact submissions are buffered in Redis Streams at memory speed. The background worker pool is the controlled mechanism that drains the buffer and persists records into MongoDB:

```text
Redis Stream (Buffer)
         |
         v
  XREADGROUP (Batch of 20-50)
         |
         v
  Controlled Worker Pool (Concurrency: 20)
         |
         v
  MongoDB bulkWrite (Upsert)
         |
         v
  XACK Stream Acknowledgment
```

The worker layer enforces **database write governance**: even if 1,000,000 submissions hit the public API in seconds, MongoDB only receives writes at a safe, controlled, non-blocking rate.

---

## 2. File-by-File Technical Deep Dive

### `lead.worker.js` — Distributed Stream Consumer & Batch Governor

`lead.worker.js` can run as an in-process thread during development or as independently scaled worker containers/processes in production (`npm run worker`).

#### Key Architectural Components & Algorithms:

1. **Controlled Concurrency & Batching**:
   ```javascript
   const concurrency = parseInt(process.env.LEAD_WORKER_CONCURRENCY || '20', 10);
   const batchSize = Math.min(concurrency, QUEUE_CONFIG.DEFAULT_BATCH_SIZE);
   ```
   * Instead of opening a new write operation for every individual event, the worker pulls a batch of up to 50 messages and combines them into a single MongoDB **`bulkWrite()`**.
   * Reduces database network round-trips by **98%** (1 bulk round-trip for 50 leads instead of 50 separate round-trips).

2. **Idempotent Upsert Strategy (`$setOnInsert`)**:
   ```javascript
   bulkOps.push({
     updateOne: {
       filter: { eventId: item.eventId },
       update: {
         $setOnInsert: {
           eventId: item.eventId,
           name: item.payload.name,
           email: item.payload.email,
           ...
         }
       },
       upsert: true
     }
   });
   ```
   * Uses MongoDB `$setOnInsert` keyed on `eventId`.
   * **Why this is critical**: If a worker crashes mid-batch after writing to MongoDB but before acknowledging to Redis (`XACK`), the replacement worker will re-read the batch. Because `$setOnInsert` only applies during insertion, the retried events will not duplicate data or overwrite newer lead states.

3. **Pending Entries List (PEL) & Crash Recovery (`XCLAIM`)**:
   * What happens if a worker server loses power while processing a batch?
   * Redis keeps all in-flight messages in the **Pending Entries List (PEL)**.
   * `recoverPendingMessages()` runs every 60 seconds:
     1. Queries `XPENDING lead-submissions crm-lead-consumers ...`.
     2. Identifies messages that have been idle for more than 30,000ms.
     3. Calls **`XCLAIM`** to transfer ownership of the abandoned messages to the current active worker.
     4. Reprocesses the batch and commits them to MongoDB.
   * **Guarantees Zero Message Loss on Worker Crashes.**

4. **Exponential Backoff & Dead Letter Queue (DLQ)**:
   * If MongoDB suffers a transient network error during a bulk write, the worker does not drop the messages.
   * It increments `retryCount`. If `retryCount < maxRetries (5)`, it re-inserts the event with backoff:
     $$\text{delay} = 2^{\text{retryCount}} \times 500\text{ms}$$
   * If a corrupt message fails 5 consecutive times, it is safely moved to the Dead Letter Queue (`FailedLeadEvent` in MongoDB and `lead-submissions-dlq` in Redis) and acknowledged from the primary stream so it does not block subsequent leads.

5. **Self-Healing on Stream Reset (`NOGROUP`)**:
   * If a DevOps engineer flushes Redis or the consumer group key is reset, the worker catches the `NOGROUP` Redis error, calls `initLeadQueue()` to automatically recreate the stream and consumer group, and resumes polling without crashing the process.

6. **Analytics Cache Invalidation**:
   * Upon successful batch persistence, the worker calls `invalidateAnalyticsCache()` (`redis.del('analytics:*')`), ensuring the CRM analytics dashboard reflects newly ingested leads immediately.

---

## 3. WHY Have We Done It This Way? (Engineering Rationale)

| Architectural Decision | Why It Was Done | Alternative Rejected & Risk |
| :--- | :--- | :--- |
| **`bulkWrite()` with `{ ordered: false }`** | Writes up to 50 leads in a single database operation; `{ ordered: false }` ensures that if one lead in a batch fails, MongoDB continues writing the remaining 49 leads. | **One-by-one writes (`Lead.create`)**: Introduces 50 individual TCP roundtrips, causing write queue congestion and MongoDB connection pool exhaustion. |
| **Idempotent `$setOnInsert`** | Makes stream retries completely safe. Re-executing an already processed event is a no-op that never creates duplicates. | **Plain `Lead.create()`**: Worker retries generate duplicate lead records and corrupt conversion statistics. |
| **PEL Recovery via `XCLAIM`** | Automatically recovers messages abandoned by crashed worker processes without manual human intervention. | **No crash recovery**: If a worker process is terminated by Kubernetes OOM killer, in-flight customer submissions vanish forever. |
| **Dead Letter Queue (DLQ) Limit (5 Retries)** | Quarantines poisoned or corrupt messages so the worker queue can keep processing healthy submissions. | **Infinite retry loops ("Poison Pill")**: A single malformed message blocks the entire consumer group indefinitely, stalling all subsequent leads. |
| **Controlled Concurrency (`LEAD_WORKER_CONCURRENCY=20`)** | Acts as the write governor for MongoDB, preventing high-speed Redis ingestion from overwhelming database CPU and disk I/O. | **Unlimited worker concurrency**: Re-introduces the exact database exhaustion problem Redis was implemented to prevent. |
