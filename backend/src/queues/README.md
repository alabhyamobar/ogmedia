# Backend Queues Layer (`backend/src/queues/`)

## 1. Directory Overview & Architectural Role

The `queues/` directory implements the **high-speed ingestion buffer** that fulfills the primary architectural requirement of the OG Media CRM:

> *"The public contact form must NOT directly write every submission synchronously to MongoDB."*

Under burst conditions (e.g. viral campaigns, product launches, or bot floods where 1,000,000 queries arrive simultaneously), direct database writes cause connection pool exhaustion, CPU lockup, and catastrophic API failure.

`lead.queue.js` decouples public HTTP ingestion from permanent MongoDB persistence using **Redis Streams**.

```text
Incoming Traffic (Burst)
          |
          v
     Express API
          |
          v
   Zod Validation
          |
          v
  checkAndSetDuplicate()  <--- Atomic 5-min Redis Deduplication
          |
          v
enqueueLeadSubmission()   <--- High-Speed Redis Stream XADD (10ms)
          |
          v
Immediate 200 OK Response to Customer
```

---

## 2. File-by-File Technical Deep Dive

### `lead.queue.js` — Redis Stream Manager & Buffer Interface

`lead.queue.js` manages stream creation, message serialization, deduplication locks, Dead Letter Queue routing, and telemetry probing.

#### Key Functions & Implementation Details:

1. **`initLeadQueue()`**:
   * Initializes the Redis Stream and consumer group:
     ```javascript
     await redis.xgroup('CREATE', 'lead-submissions', 'crm-lead-consumers', '$', 'MKSTREAM');
     ```
   * **`MKSTREAM`**: Automatically provisions the stream if it does not yet exist.
   * **`$` Pointer**: Configures new consumer groups to begin listening only to new messages arriving from this point forward.
   * **`BUSYGROUP` Resilience**: Catches `BUSYGROUP Consumer Group name already exists` errors during multi-instance boots or restarts without throwing an unhandled exception.

2. **`enqueueLeadSubmission(payload)`**:
   * Assigns a globally unique `eventId` (UUID v4) to the submission.
   * Packages the event payload with metadata:
     * `eventId`: Correlation token
     * `eventType`: `'LEAD_CREATED'`
     * `timestamp`: ISO-8601 UTC timestamp
     * `retryCount`: `'0'`
     * `payload`: JSON stringified contact data
   * Writes the entry to the stream via **`XADD lead-submissions * ...`**.
   * Returns `{ eventId, streamMessageId }` to the controller within single-digit milliseconds.

3. **`checkAndSetDuplicate(email, phone, service)`**:
   * **Atomic Deduplication Pattern**:
     ```javascript
     const hash = crypto.createHash('md5').update(`${email}:${phone}:${service}`).digest('hex');
     const key = `dedup:lead:${hash}`;
     const result = await redis.set(key, '1', 'EX', 300, 'NX');
     return result === null; // true if already exists
     ```
   * Utilizes Redis `SET ... EX 300 NX` (Set if Not eXists with 300s TTL).
   * **Why this is optimal**: It performs duplicate detection and lock acquisition in a **single atomic CPU cycle in Redis**. There are no race conditions between two concurrent requests with identical emails.

4. **`enqueueToDLQ(item, reason)`**:
   * Dual-destination Dead Letter mechanism:
     1. Writes an unparseable or repeatedly failing event into the MongoDB `FailedLeadEvent` collection.
     2. Enqueues a notification to the `lead-submissions-dlq` Redis stream.
   * Guarantees administrators have full visibility into failed leads without losing contact records.

5. **`getQueueMetrics()`**:
   * Gathers real-time telemetry:
     * `streamLength`: Total items in `lead-submissions` (`XLEN`)
     * `pendingCount`: Total in-flight unacknowledged items (`XINFO GROUPS`)
     * `consumersCount`: Active registered workers
     * `dlqLength`: Total items in Dead Letter Queue (`XLEN`)

---

## 3. WHY Have We Done It This Way? (Engineering Rationale)

| Architectural Decision | Why It Was Done | Alternative Rejected & Risk |
| :--- | :--- | :--- |
| **Redis Streams (`XADD`) vs BullMQ** | Redis Streams is a native, lightweight Redis data structure with near-zero overhead, supporting high-throughput ingestion with consumer groups and explicit ACKs. | **Heavy external queue dependencies**: Multi-table abstractions introduce unnecessary Redis memory overhead and polling delays. |
| **`SET ... EX 300 NX` Deduplication** | Executes atomic deduplication in a single O(1) Redis command without race conditions. | **Querying MongoDB for recent submissions**: Scanning MongoDB on every public contact submission exposes the database to the exact burst load we are trying to prevent. |
| **`eventId` Generated in Queue Layer** | Generates an immutable UUID before Redis ingestion that follows the lead all the way into MongoDB. | **Generating IDs in the worker or MongoDB**: Makes idempotent retries impossible if a worker crashes before saving. |
| **Fast Acknowledgement (Return after `XADD`)** | Slashes public API latency from 200-500ms down to 10-30ms, allowing load balancers and clients to handle massive traffic spikes. | **Waiting for MongoDB write before responding**: Public clients experience timeouts during database write spikes, leading to frantic user resubmissions. |
| **Dual DLQ (MongoDB + Redis Stream)** | Ensures failed events are durably persisted in MongoDB while remaining observable in Redis queues for ops monitoring. | **Silently logging errors to console**: Makes failed leads invisible and impossible to audit or recover. |
