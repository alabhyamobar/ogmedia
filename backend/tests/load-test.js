import http from 'http';
import { getRedisClient, closeRedis } from '../src/config/redis.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { Lead } from '../src/models/Lead.js';
import { getQueueMetrics } from '../src/queues/lead.queue.js';
import { SERVICES } from '../src/constants/index.js';

// Parse arguments: e.g. `node tests/load-test.js --count 2000 --concurrency 50`
const args = process.argv.slice(2);
let requestCount = 1000;
let concurrency = 50;
const apiUrl = process.env.API_URL || 'http://127.0.0.1:4000/api/v1/public/leads';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--count' && args[i + 1]) {
    requestCount = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--concurrency' && args[i + 1]) {
    concurrency = parseInt(args[i + 1], 10);
    i++;
  }
}

const serviceList = Object.values(SERVICES);

function makeRequest(index) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      name: `Load Test User ${index}`,
      email: `loadtest.${Date.now()}.${index}.${Math.random().toString(36).substring(7)}@loadtest.ogmedia.test`,
      phone: `+1-555-${String(index).padStart(4, '0')}`,
      company: `Enterprise Client ${index}`,
      service: serviceList[index % serviceList.length],
      message: `High-volume burst submission benchmark iteration ${index}`
    });

    const start = performance.now();
    const url = new URL(apiUrl);

    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 10000
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          const latency = performance.now() - start;
          resolve({
            success: res.statusCode === 200,
            statusCode: res.statusCode,
            latency
          });
        });
      }
    );

    req.on('error', (err) => {
      const latency = performance.now() - start;
      resolve({
        success: false,
        statusCode: 0,
        error: err.message,
        latency
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        statusCode: 408,
        error: 'TIMEOUT',
        latency: performance.now() - start
      });
    });

    req.write(payload);
    req.end();
  });
}

async function runLoadTest() {
  console.log('\n======================================================');
  console.log('       OG MEDIA CRM - INGESTION LOAD BENCHMARK        ');
  console.log('======================================================');
  console.log(`Target URL:       ${apiUrl}`);
  console.log(`Total Requests:   ${requestCount.toLocaleString()}`);
  console.log(`Concurrency:      ${concurrency}`);
  console.log('------------------------------------------------------\n');

  await connectDB();
  getRedisClient();

  const initialMongoCount = await Lead.countDocuments();
  const initialQueueMetrics = await getQueueMetrics();

  console.log(`Initial MongoDB Leads: ${initialMongoCount}`);
  console.log(`Initial Redis Queue Length: ${initialQueueMetrics.queueLength}\n`);
  console.log('Starting burst ingestion test...');

  const startTime = performance.now();
  const results = [];
  let completed = 0;
  let cursor = 0;

  // Worker pool for concurrency control
  async function worker() {
    while (cursor < requestCount) {
      const idx = cursor++;
      const res = await makeRequest(idx);
      results.push(res);
      completed++;

      if (completed % Math.max(100, Math.floor(requestCount / 10)) === 0 || completed === requestCount) {
        process.stdout.write(`  Progress: ${completed} / ${requestCount} (${Math.round((completed / requestCount) * 100)}%)\r`);
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  const totalDurationMs = performance.now() - startTime;
  const totalDurationSec = totalDurationMs / 1000;

  console.log('\n\nIngestion burst completed in ' + totalDurationSec.toFixed(2) + ' seconds.');

  // Latency calculation
  const latencies = results.map((r) => r.latency).sort((a, b) => a - b);
  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.length - successCount;

  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const rps = Math.round(results.length / totalDurationSec);

  console.log('\n------------------------------------------------------');
  console.log('              INGESTION METRICS (API -> REDIS)        ');
  console.log('------------------------------------------------------');
  console.log(`Throughput:       ${rps.toLocaleString()} requests/second`);
  console.log(`Success Rate:     ${((successCount / results.length) * 100).toFixed(2)}% (${successCount}/${results.length})`);
  console.log(`Failures:         ${failureCount}`);
  console.log(`Avg Latency:      ${avgLatency.toFixed(2)} ms`);
  console.log(`P50 Latency:      ${p50.toFixed(2)} ms`);
  console.log(`P95 Latency:      ${p95.toFixed(2)} ms`);
  console.log(`P99 Latency:      ${p99.toFixed(2)} ms`);

  // Wait for workers to persist into MongoDB
  console.log('\n------------------------------------------------------');
  console.log('       BACKGROUND WORKER DRAIN METRICS (REDIS -> MONGO)');
  console.log('------------------------------------------------------');
  console.log('Observing background worker drain rate...');

  const drainStart = performance.now();
  let remainingQueue = await getQueueMetrics();
  let currentMongoCount = await Lead.countDocuments();

  while (currentMongoCount - initialMongoCount < successCount && performance.now() - drainStart < 30000) {
    await new Promise((r) => setTimeout(r, 500));
    currentMongoCount = await Lead.countDocuments();
    remainingQueue = await getQueueMetrics();
    const persisted = currentMongoCount - initialMongoCount;
    process.stdout.write(
      `  Worker drain: ${persisted} / ${successCount} leads written to MongoDB (Pending in Redis: ${remainingQueue.pendingCount})\r`
    );
  }

  const drainDurationSec = (performance.now() - drainStart) / 1000;
  const finalMongoCount = await Lead.countDocuments();
  const totalPersisted = finalMongoCount - initialMongoCount;
  const writeRps = drainDurationSec > 0 ? Math.round(totalPersisted / drainDurationSec) : totalPersisted;

  console.log('\n\nWorker Processing Complete!');
  console.log(`Total Leads Persisted to MongoDB: ${totalPersisted}`);
  console.log(`Controlled Write Throughput:       ${writeRps} writes/second`);
  console.log('======================================================\n');

  await disconnectDB();
  await closeRedis();
  process.exit(0);
}

runLoadTest().catch((err) => {
  console.error('Load test fatal error:', err);
  process.exit(1);
});
