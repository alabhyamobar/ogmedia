# Backend Utilities Layer (`backend/src/utils/`)

## 1. Directory Overview & Architectural Role

The `utils/` directory provides **cross-cutting infrastructure utilities** used throughout the application.

In high-throughput distributed systems, **observability must not become the bottleneck**. Naive use of `console.log` in Node.js is synchronous, blocks the event loop, and outputs unformatted strings that cannot be indexed or queried by modern log aggregators (e.g. Datadog, Grafana Loki, AWS CloudWatch, Elasticsearch).

`logger.js` implements a zero-overhead, asynchronous, structured logging engine powered by **Pino**.

---

## 2. File-by-File Technical Deep Dive

### `logger.js` — Structured Asynchronous Logging & Secret Redaction

#### Key Implementation Details:

1. **Structured JSON vs Plain Text**:
   * In production (`NODE_ENV === 'production'`), the logger outputs single-line NDJSON (Newline Delimited JSON).
   * Every log record includes machine-readable keys: `level`, `time`, `pid`, `hostname`, `msg`, `requestId`, `duration`, `statusCode`, and domain metadata.
   * In development, it pipes to `pino-pretty` with colorized console formatting and human-readable timestamps.

2. **Automated Secret Redaction Pipeline**:
   ```javascript
   redact: {
     paths: [
       'req.headers.authorization',
       'req.headers.cookie',
       'password',
       'passwordHash',
       'token',
       'refreshToken',
       'accessToken',
       'secret',
       '*.password',
       '*.passwordHash'
     ],
     censor: '[REDACTED]'
   }
   ```
   * Any object logged containing sensitive fields (passwords, JWTs, cookie headers, API keys) has those values automatically replaced with `[REDACTED]` before serialization.
   * This is a critical regulatory defense: even if an engineer accidentally logs `logger.info(req.body)`, customer passwords and tokens can never leak into log files.

3. **High Performance / Low Latency**:
   * Pino is up to **5x faster** than Winston and Bunyan because it minimizes object allocations and uses extreme asynchronous string concatenation.

---

## 3. WHY Have We Done It This Way? (Engineering Rationale)

| Architectural Decision | Why It Was Done | Alternative Rejected & Risk |
| :--- | :--- | :--- |
| **Pino Structured Logger** | Blazing-fast JSON logging that does not block the Node.js event loop during high-concurrency ingestion bursts. | **`console.log()`**: Synchronous I/O in Node.js. Under 10,000 req/sec, `console.log` halts the event loop and cuts throughput in half. |
| **Built-in Secret Redaction** | Guarantees compliance (GDPR, SOC2, ISO 27001) by ensuring authentication secrets and customer credentials are never written to disk or third-party log dashboards. | **Manual redaction**: Developers inevitably forget to scrub objects before calling log functions, resulting in password exposure. |
| **Correlation via `requestId`** | Links every log line across middleware, controllers, Redis queues, and background workers back to the originating HTTP request. | **Uncorrelated logs**: Under simultaneous high-volume traffic, concurrent log statements interweave, making debugging impossible. |
| **NDJSON Format in Production** | Ingested seamlessly by Datadog, CloudWatch, and Elasticsearch without requiring complex regex parsing rules. | **Multi-line plain text strings**: Crashes log scrapers and causes multi-line stack traces to be parsed as separate disjointed events. |
