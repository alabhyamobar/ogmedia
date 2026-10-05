import 'dotenv/config';
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { getRedisClient, closeRedis, isRedisHealthy } from '../src/config/redis.js';
import { initLeadQueue, enqueueLeadSubmission, checkAndSetDuplicate } from '../src/queues/lead.queue.js';
import { User } from '../src/models/User.js';
import { Lead } from '../src/models/Lead.js';
import { AuditLog } from '../src/models/AuditLog.js';
import { ROLES, SERVICES, LEAD_STATUS } from '../src/constants/index.js';
import { buildLeadScopeFilter } from '../src/middleware/auth.js';

describe('OG Media CRM - Production Integration Test Suite', () => {
  let redis;
  let redisAvailable = false;

  before(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
    redisAvailable = await isRedisHealthy();
    if (redisAvailable) {
      redis = getRedisClient();
      await initLeadQueue();
    }
  });

  after(async () => {
    await disconnectDB();
    await closeRedis();
  });

  describe('1. Ingestion Queue, Direct DB Mode & Deduplication', () => {
    test('Should ingest valid lead submission (Redis Stream or Direct DB) and return eventId', async () => {
      const payload = {
        name: 'Tony Stark',
        email: `tony.${Date.now()}@starkindustries.com`,
        phone: '+1-555-0800',
        company: 'Stark Industries',
        service: SERVICES.WEB_DEVELOPMENT,
        message: 'Building a new Jarvis interactive web dashboard.'
      };

      const result = await enqueueLeadSubmission(payload);
      assert.ok(result.eventId, 'Expected eventId to be generated');

      if (redisAvailable) {
        assert.ok(result.streamMessageId, 'Expected Redis stream message ID in buffered mode');
        const range = await redis.xrange('lead-submissions', result.streamMessageId, result.streamMessageId);
        assert.equal(range.length, 1, 'Stream should contain the enqueued entry');
      } else {
        // Direct Database Mode verification
        assert.equal(result.mode, 'DIRECT_DATABASE');
        const savedLead = await Lead.findOne({ eventId: result.eventId });
        assert.ok(savedLead, 'Lead should be persisted directly to MongoDB');
        assert.equal(savedLead.email, payload.email.toLowerCase());
        assert.equal(savedLead.status, 'NEW');
        assert.ok(savedLead.timeline.length > 0, 'Timeline entry should be recorded');
      }
    });

    test('Should detect duplicate submission within window (Redis or MongoDB backed)', async () => {
      const email = `duplicate.test.${Date.now()}@example.com`;
      const phone = '+1-555-9999';
      const service = SERVICES.GOOGLE_ADS;

      // First submission: should not be duplicate
      const firstCheck = await checkAndSetDuplicate(email, phone, service, 'event-1');
      assert.equal(firstCheck, false, 'First submission should not be flagged as duplicate');

      // Second submission: should be detected as duplicate
      const secondCheck = await checkAndSetDuplicate(email, phone, service, 'event-2');
      assert.equal(secondCheck, true, 'Immediate repeat submission should be flagged as duplicate');
    });
  });

  describe('2. Database Scoping & Expertise-Based Isolation (RBAC)', () => {
    test('Super Admin should see all leads without service restriction', () => {
      const superAdminUser = {
        role: ROLES.SUPER_ADMIN,
        expertise: [SERVICES.META_ADS, SERVICES.SEO]
      };

      const filter = buildLeadScopeFilter(superAdminUser, { status: 'NEW' });
      assert.equal(filter.service, undefined, 'Admin filter should not restrict service');
      assert.equal(filter.status, 'NEW');
    });

    test('Employee should be strictly scoped to their assigned expertise array', () => {
      const rahulEmployee = {
        role: ROLES.EMPLOYEE,
        expertise: [SERVICES.META_ADS]
      };

      const filter = buildLeadScopeFilter(rahulEmployee, {});
      assert.deepEqual(filter.service, { $in: [SERVICES.META_ADS] }, 'Employee filter must inject $in expertise');
    });

    test('Employee requesting unauthorized service receives empty match filter', () => {
      const rahulEmployee = {
        role: ROLES.EMPLOYEE,
        expertise: [SERVICES.META_ADS]
      };

      // Rahul maliciously tries to filter by SEO
      const filter = buildLeadScopeFilter(rahulEmployee, { service: SERVICES.SEO });
      assert.deepEqual(filter.service, { $in: [] }, 'Attempt to query unauthorized service should result in empty set');
    });

    test('Employee with multiple assigned services can view all authorized categories', () => {
      const multiExpertiseUser = {
        role: ROLES.EMPLOYEE,
        expertise: [SERVICES.META_ADS, SERVICES.GOOGLE_ADS]
      };

      const filter = buildLeadScopeFilter(multiExpertiseUser, {});
      assert.deepEqual(filter.service, { $in: [SERVICES.META_ADS, SERVICES.GOOGLE_ADS] });
    });
  });

  describe('3. Password Hashing & Security', () => {
    test('User password should be securely hashed with bcrypt', async () => {
      const plainPassword = 'SuperSecureSecret123!';
      const hash = await User.hashPassword(plainPassword);

      assert.notEqual(plainPassword, hash, 'Password should never match plain text');
      assert.ok(hash.startsWith('$2'), 'Hash should be valid bcrypt hash');

      const dummyUser = new User({ passwordHash: hash });
      const isValid = await dummyUser.comparePassword(plainPassword);
      assert.equal(isValid, true, 'Correct password should compare true');

      const isInvalid = await dummyUser.comparePassword('WrongPassword123');
      assert.equal(isInvalid, false, 'Incorrect password should compare false');
    });
  });

  describe('4. Audit Logging Immutability', () => {
    test('Audit log records should be created and prevent modification', async () => {
      const log = await AuditLog.create({
        action: 'LEAD_CREATED',
        targetType: 'LEAD',
        targetId: 'lead-test-123',
        performedByName: 'SYSTEM',
        details: { test: true }
      });

      assert.ok(log._id, 'Audit log saved');

      // Attempting to modify should fail
      log.targetId = 'tampered-id';
      await assert.rejects(
        async () => {
          await log.save();
        },
        /Audit logs are append-only/,
        'Should reject modification of audit log'
      );
    });
  });
});
