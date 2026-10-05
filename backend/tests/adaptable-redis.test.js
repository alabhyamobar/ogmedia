import 'dotenv/config';
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import { connectDB, disconnectDB } from '../src/config/db.js';
import {
  isRedisConfigured,
  isRedisHealthy,
  getRedisClient,
  getRedisStatus,
  closeRedis
} from '../src/config/redis.js';
import {
  initLeadQueue,
  enqueueLeadSubmission,
  checkAndSetDuplicate,
  getQueueMetrics
} from '../src/queues/lead.queue.js';
import { getCache, setCache, invalidateCachePattern } from '../src/utils/cache.js';
import { saveLeadDirectlyToDatabase } from '../src/services/leadPersistence.service.js';
import { createApp } from '../src/app.js';
import { Lead } from '../src/models/Lead.js';
import { AuditLog } from '../src/models/AuditLog.js';
import { SERVICES, LEAD_STATUS } from '../src/constants/index.js';

describe('Adaptable CRM - Redis Independence & Direct Database Resilience', () => {
  let server;
  let serverPort;
  let baseUrl;

  before(async () => {
    process.env.NODE_ENV = 'test';
    process.env.SKIP_RATE_LIMIT = 'false'; // Test active rate limiter with adaptable store
    await connectDB();

    const app = createApp();
    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(0, () => {
        serverPort = server.address().port;
        baseUrl = `http://127.0.0.1:${serverPort}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await disconnectDB();
    await closeRedis();
  });

  describe('1. Redis Graceful Degradation & Config Detection', () => {
    test('isRedisConfigured accurately detects presence of Redis URL', () => {
      const configured = isRedisConfigured();
      assert.equal(typeof configured, 'boolean');
    });

    test('isRedisHealthy safely returns boolean without throwing on unhandled errors', async () => {
      const healthy = await isRedisHealthy();
      assert.equal(typeof healthy, 'boolean');
    });

    test('getRedisStatus reports operating mode (DIRECT_DATABASE or REDIS_BUFFER)', async () => {
      const status = await getRedisStatus();
      assert.ok(status.status);
      assert.ok(['DIRECT_DATABASE', 'REDIS_BUFFER'].includes(status.mode));
    });

    test('initLeadQueue does not throw when Redis is offline', async () => {
      await assert.doesNotReject(async () => {
        await initLeadQueue();
      });
    });

    test('getQueueMetrics returns graceful degraded / direct mode metrics without throwing', async () => {
      const metrics = await getQueueMetrics();
      assert.ok(metrics.status);
      assert.ok(metrics.mode);
      assert.equal(typeof metrics.queueLength, 'number');
    });
  });

  describe('2. Direct Database Lead Persistence & Deduplication', () => {
    test('saveLeadDirectlyToDatabase successfully stores lead with status NEW and timeline entry', async () => {
      const testEmail = `direct.lead.${Date.now()}@example.com`;
      const payload = {
        name: 'Bruce Wayne',
        email: testEmail,
        phone: '+1-555-0199',
        company: 'Wayne Enterprises',
        service: SERVICES.SEO,
        message: 'Need complete enterprise SEO audit.',
        source: 'WEBSITE'
      };

      const result = await saveLeadDirectlyToDatabase(payload);
      assert.ok(result.eventId, 'Expected eventId');
      assert.equal(result.mode, 'DIRECT_DATABASE');

      // Verify in MongoDB
      const found = await Lead.findOne({ eventId: result.eventId });
      assert.ok(found, 'Lead document must exist in MongoDB');
      assert.equal(found.status, LEAD_STATUS.NEW);
      assert.equal(found.email, testEmail.toLowerCase());
      assert.ok(found.timeline.length > 0, 'Timeline must be recorded');
      assert.equal(found.timeline[0].event, 'LEAD_CREATED');

      // Verify AuditLog
      const audit = await AuditLog.findOne({ targetId: result.eventId });
      assert.ok(audit, 'Audit log record must be created');
      assert.equal(audit.action, 'LEAD_CREATED');
    });

    test('checkAndSetDuplicate correctly identifies repeat submissions in direct DB mode', async () => {
      const testEmail = `dedup.direct.${Date.now()}@example.com`;
      const testPhone = '+1-555-4321';
      const service = SERVICES.CONTENT_MARKETING;

      // First check -> false (new)
      const isDup1 = await checkAndSetDuplicate(testEmail, testPhone, service, 'ev-1');
      assert.equal(isDup1, false, 'First submission is not duplicate');

      // Insert lead
      await saveLeadDirectlyToDatabase({
        eventId: 'ev-1',
        name: 'Clark Kent',
        email: testEmail,
        phone: testPhone,
        service,
        message: 'Content creation inquiry'
      });

      // Second check -> true (duplicate detected!)
      const isDup2 = await checkAndSetDuplicate(testEmail, testPhone, service, 'ev-2');
      assert.equal(isDup2, true, 'Subsequent submission should be detected as duplicate');
    });
  });

  describe('3. Unified Cache Fallback Resilience', () => {
    test('setCache and getCache operate transparently without throwing', async () => {
      const cacheKey = `test:key:${Date.now()}`;
      const payload = { foo: 'bar', timestamp: Date.now() };

      await setCache(cacheKey, payload, 60);
      const retrieved = await getCache(cacheKey);

      assert.deepEqual(retrieved, payload);
    });

    test('invalidateCachePattern clears keys without throwing', async () => {
      const prefix = `test:pattern:${Date.now()}`;
      await setCache(`${prefix}:item1`, { a: 1 }, 60);
      await setCache(`${prefix}:item2`, { b: 2 }, 60);

      await invalidateCachePattern(`${prefix}:*`);
      const val1 = await getCache(`${prefix}:item1`);
      const val2 = await getCache(`${prefix}:item2`);

      assert.equal(val1, null);
      assert.equal(val2, null);
    });
  });

  describe('4. Full HTTP API Integration in Direct Database Mode', () => {
    test('GET /health returns 200 OK', async () => {
      const res = await fetch(`${baseUrl}/health`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.status, 'OK');
      assert.ok(typeof body.uptime === 'number');
    });

    test('GET /health/ready returns 200 READY even when Redis is offline', async () => {
      const res = await fetch(`${baseUrl}/health/ready`);
      assert.equal(res.status, 200, 'Readiness should return 200 when database is healthy');
      const body = await res.json();
      assert.equal(body.status, 'READY');
      assert.equal(body.checks.database, 'UP');
      assert.ok(['DIRECT_DATABASE', 'REDIS_BUFFER'].includes(body.mode));
    });

    test('POST /api/v1/public/leads returns 200 OK and stores lead directly into database', async () => {
      const leadPayload = {
        name: 'Diana Prince',
        email: `diana.${Date.now()}@themyscira.gov`,
        phone: '+1-555-7777',
        company: 'Themyscira Embassy',
        service: SERVICES.META_ADS,
        message: 'Looking for a comprehensive marketing campaign for our cultural outreach.',
        honeypot: ''
      };

      const res = await fetch(`${baseUrl}/api/v1/public/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload)
      });

      assert.equal(res.status, 200, 'Public lead submission must return 200 OK, never 503');
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.eventId, 'Expected eventId in response');
      assert.ok(['DIRECT_DATABASE', 'REDIS_BUFFER'].includes(body.mode));

      // Verify the lead is queryable in MongoDB
      const dbLead = await Lead.findOne({ eventId: body.eventId });
      assert.ok(dbLead, 'Submitted lead must exist in MongoDB database');
      assert.equal(dbLead.name, leadPayload.name);
      assert.equal(dbLead.service, leadPayload.service);
    });

    test('POST /api/v1/public/leads catches repeat submissions and returns 200 isDuplicate', async () => {
      const duplicatePayload = {
        name: 'Barry Allen',
        email: `barry.allen.${Date.now()}@ccpd.org`,
        phone: '+1-555-3333',
        company: 'CCPD Forensic Lab',
        service: SERVICES.WEB_DEVELOPMENT,
        message: 'Fast turnaround website needed.',
        honeypot: ''
      };

      // First submit
      const res1 = await fetch(`${baseUrl}/api/v1/public/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicatePayload)
      });
      assert.equal(res1.status, 200);

      // Repeat submit
      const res2 = await fetch(`${baseUrl}/api/v1/public/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicatePayload)
      });
      assert.equal(res2.status, 200);
      const body2 = await res2.json();
      assert.equal(body2.success, true);
      assert.equal(body2.isDuplicate, true, 'Immediate duplicate should be flagged isDuplicate: true');
    });

    test('POST /api/v1/public/leads safely traps honeypot bots without queueing or saving', async () => {
      const botPayload = {
        name: 'Spam Bot 3000',
        email: 'spambot@spam.com',
        service: SERVICES.SEO,
        message: 'Buy cheap links now',
        honeypot: 'I am a malicious bot'
      };

      const res = await fetch(`${baseUrl}/api/v1/public/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(botPayload)
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.eventId, undefined, 'Bot trapped: no eventId generated');

      const found = await Lead.findOne({ email: 'spambot@spam.com' });
      assert.equal(found, null, 'Bot submission must not be saved into database');
    });
  });
});
