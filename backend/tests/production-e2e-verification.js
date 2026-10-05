import 'dotenv/config';
import http from 'http';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { closeRedis, isRedisHealthy, getRedisStatus } from '../src/config/redis.js';
import { Lead } from '../src/models/Lead.js';
import { User } from '../src/models/User.js';
import { SERVICES, LEAD_STATUS, ROLES } from '../src/constants/index.js';

let server;
let baseUrl;

async function runProductionTests() {
  console.log('\n===============================================================');
  console.log('       OG MEDIA CRM - PRODUCTION E2E VERIFICATION SUITE         ');
  console.log('===============================================================\n');

  // 1. Database & Cache Initialization
  console.log('1. Checking Database and Redis Infrastructure State...');
  await connectDB();
  const redisHealthy = await isRedisHealthy();
  const redisStatus = await getRedisStatus();
  console.log(`   ✓ MongoDB: Connected`);
  console.log(`   ✓ Redis Configured: ${redisStatus.configured}`);
  console.log(`   ✓ Redis Status:     ${redisStatus.status}`);
  console.log(`   ✓ Operating Mode:   ${redisStatus.mode}`);

  // 2. Start HTTP Server
  console.log('\n2. Starting HTTP Server in Production Mode...');
  const app = createApp();
  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`   ✓ Server listening at ${baseUrl}`);
      resolve();
    });
  });

  let developerToken;
  let adminToken;
  let staffToken;

  // 3. Health & Readiness Endpoints
  console.log('\n3. Testing System Health & Readiness Endpoints...');
  {
    const resHealth = await fetch(`${baseUrl}/health`);
    assert.equal(resHealth.status, 200, '/health should return 200');
    const healthData = await resHealth.json();
    assert.equal(healthData.status, 'OK');
    console.log('   ✓ GET /health -> 200 OK');

    const resReady = await fetch(`${baseUrl}/health/ready`);
    assert.equal(resReady.status, 200, '/health/ready should return 200 in direct DB mode');
    const readyData = await resReady.json();
    assert.equal(readyData.status, 'READY');
    assert.equal(readyData.checks.database, 'UP');
    assert.ok(['DIRECT_DATABASE', 'REDIS_BUFFER'].includes(readyData.mode));
    console.log(`   ✓ GET /health/ready -> 200 READY (mode: ${readyData.mode})`);
  }

  // 4. Authentication Verification
  console.log('\n4. Testing Authentication & Session Management...');
  {
    // Developer login
    const devRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: 'developer', password: 'DevPass2026!@' })
    });
    assert.equal(devRes.status, 200, 'Developer login should succeed');
    const devData = await devRes.json();
    assert.ok(devData.data.accessToken);
    developerToken = devData.data.accessToken;
    console.log('   ✓ Developer Authentication (@developer) -> 200 OK');

    // Admin login
    const adminRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: 'admin', password: 'AdminPass2026!@' })
    });
    assert.equal(adminRes.status, 200, 'Admin login should succeed');
    const adminData = await adminRes.json();
    adminToken = adminData.data.accessToken;
    console.log('   ✓ Administrator Authentication (@admin) -> 200 OK');

    // Staff login
    const staffRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: 'maya.ads', password: 'AgentPass2026!@' })
    });
    assert.equal(staffRes.status, 200, 'Staff login should succeed');
    const staffData = await staffRes.json();
    staffToken = staffData.data.accessToken;
    console.log('   ✓ Staff Authentication (@maya.ads) -> 200 OK');

    // Verify /api/v1/auth/me
    const meRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${developerToken}` }
    });
    assert.equal(meRes.status, 200);
    const meData = await meRes.json();
    assert.equal(meData.data.user.username, 'developer');
    console.log('   ✓ GET /api/v1/auth/me -> 200 OK');
  }

  // 5. Public Ingestion (Adaptable Lead Creation)
  console.log('\n5. Testing Public Lead Ingestion in Direct DB Mode...');
  let testLeadId;
  let testEventId;
  {
    const leadPayload = {
      name: 'Eleanor Vance',
      email: `eleanor.${Date.now()}@hillhouse.design`,
      phone: '+1-555-8833',
      company: 'Hill House Architecture',
      service: SERVICES.WEB_DEVELOPMENT,
      message: 'Need full 3D interactive web portal redesign.',
      honeypot: ''
    };

    const res = await fetch(`${baseUrl}/api/v1/public/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadPayload)
    });
    assert.equal(res.status, 200, 'Public lead submission must return 200');
    const resData = await res.json();
    assert.equal(resData.success, true);
    assert.ok(resData.eventId);
    testEventId = resData.eventId;
    console.log(`   ✓ POST /api/v1/public/leads -> 200 OK (eventId: ${resData.eventId}, mode: ${resData.mode})`);

    // Verify persisted directly in MongoDB
    const persistedLead = await Lead.findOne({ eventId: testEventId });
    assert.ok(persistedLead, 'Lead must exist in MongoDB');
    assert.equal(persistedLead.name, leadPayload.name);
    assert.equal(persistedLead.status, LEAD_STATUS.NEW);
    assert.ok(persistedLead.timeline.length > 0);
    testLeadId = persistedLead._id.toString();
    console.log(`   ✓ Verified MongoDB Document: ${testLeadId} [status: ${persistedLead.status}]`);

    // Test duplicate detection
    const dupRes = await fetch(`${baseUrl}/api/v1/public/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadPayload)
    });
    assert.equal(dupRes.status, 200);
    const dupData = await dupRes.json();
    assert.equal(dupData.isDuplicate, true, 'Immediate duplicate should be detected');
    console.log('   ✓ Duplicate Detection Check -> 200 OK (isDuplicate: true)');

    // Test honeypot bot trap
    const botRes = await fetch(`${baseUrl}/api/v1/public/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...leadPayload,
        email: 'bot@spam.com',
        honeypot: 'malicious bot text'
      })
    });
    assert.equal(botRes.status, 200);
    const botData = await botRes.json();
    assert.equal(botData.eventId, undefined);
    const botDoc = await Lead.findOne({ email: 'bot@spam.com' });
    assert.equal(botDoc, null);
    console.log('   ✓ Honeypot Trap Check -> 200 OK (bot successfully discarded)');
  }

  // 6. Lead Scoping, RBAC & Workflow Operations
  console.log('\n6. Testing Lead Retrieval, RBAC Isolation & Status Changes...');
  {
    // Admin retrieves leads
    const adminLeadsRes = await fetch(`${baseUrl}/api/v1/leads?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(adminLeadsRes.status, 200);
    const adminLeadsData = await adminLeadsRes.json();
    assert.ok(adminLeadsData.data.leads.length > 0);
    console.log(`   ✓ Admin GET /api/v1/leads -> 200 OK (returned ${adminLeadsData.data.leads.length} leads)`);

    // Staff retrieves leads (strictly scoped to META_ADS & GOOGLE_ADS)
    const staffLeadsRes = await fetch(`${baseUrl}/api/v1/leads?page=1&limit=50`, {
      headers: { Authorization: `Bearer ${staffToken}` }
    });
    assert.equal(staffLeadsRes.status, 200);
    const staffLeadsData = await staffLeadsRes.json();
    for (const lead of staffLeadsData.data.leads) {
      assert.ok(
        [SERVICES.META_ADS, SERVICES.GOOGLE_ADS].includes(lead.service),
        `Staff member should only see authorized services, got ${lead.service}`
      );
    }
    console.log(`   ✓ Staff RBAC Scope Check -> 200 OK (100% of ${staffLeadsData.data.leads.length} leads within expertise)`);

    // Update lead status
    const statusRes = await fetch(`${baseUrl}/api/v1/leads/${testLeadId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${developerToken}`
      },
      body: JSON.stringify({
        status: LEAD_STATUS.QUALIFIED,
        note: 'Customer confirmed budget of $25,000 for interactive 3D web experience.'
      })
    });
    assert.equal(statusRes.status, 200);
    const statusData = await statusRes.json();
    assert.equal(statusData.data.lead.status, LEAD_STATUS.QUALIFIED);
    console.log(`   ✓ PATCH /api/v1/leads/:id/status -> 200 OK (status updated to QUALIFIED)`);

    // Add note
    const noteRes = await fetch(`${baseUrl}/api/v1/leads/${testLeadId}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${developerToken}`
      },
      body: JSON.stringify({ text: 'Scheduled discovery zoom call for Wednesday 3 PM.' })
    });
    assert.equal(noteRes.status, 201);
    console.log(`   ✓ POST /api/v1/leads/:id/notes -> 201 Created`);

    // Assign lead to employee with matching expertise
    const devonEmployee = await User.findOne({ username: 'devon.code' });
    const assignRes = await fetch(`${baseUrl}/api/v1/leads/${testLeadId}/assignment`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${developerToken}`
      },
      body: JSON.stringify({ employeeId: devonEmployee._id.toString() })
    });
    assert.equal(assignRes.status, 200);
    const assignData = await assignRes.json();
    assert.equal(assignData.data.lead.assignedTo.toString(), devonEmployee._id.toString());
    console.log(`   ✓ PATCH /api/v1/leads/:id/assignment -> 200 OK (assigned to @devon.code)`);
  }

  // 7. Analytics Calculation in Direct DB Mode
  console.log('\n7. Testing Analytics Computations in Direct DB Mode...');
  {
    // Overview Analytics
    const overviewRes = await fetch(`${baseUrl}/api/v1/analytics/overview`, {
      headers: { Authorization: `Bearer ${developerToken}` }
    });
    assert.equal(overviewRes.status, 200);
    const overviewData = await overviewRes.json();
    assert.ok(overviewData.data.counts.TOTAL > 0);
    assert.equal(typeof overviewData.data.conversionRate, 'number');
    console.log(`   ✓ GET /api/v1/analytics/overview -> 200 OK (total leads: ${overviewData.data.counts.TOTAL}, conversion rate: ${overviewData.data.conversionRate}%, source: ${overviewData.source})`);

    // Services Analytics
    const servicesRes = await fetch(`${baseUrl}/api/v1/analytics/services`, {
      headers: { Authorization: `Bearer ${developerToken}` }
    });
    assert.equal(servicesRes.status, 200);
    const servicesData = await servicesRes.json();
    assert.ok(Array.isArray(servicesData.data));
    console.log(`   ✓ GET /api/v1/analytics/services -> 200 OK (${servicesData.data.length} services aggregated)`);

    // Employee Analytics
    const empRes = await fetch(`${baseUrl}/api/v1/analytics/employees`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(empRes.status, 200);
    const empData = await empRes.json();
    assert.ok(Array.isArray(empData.data));
    console.log(`   ✓ GET /api/v1/analytics/employees -> 200 OK (${empData.data.length} employees evaluated)`);
  }

  // 8. Developer Telemetry & Security Diagnostics
  console.log('\n8. Testing Developer Telemetry & Diagnostics...');
  {
    const devHealthRes = await fetch(`${baseUrl}/api/v1/system/health`, {
      headers: { Authorization: `Bearer ${developerToken}` }
    });
    assert.equal(devHealthRes.status, 200);
    const devHealthData = await devHealthRes.json();
    assert.equal(devHealthData.data.database.status, 'UP');
    assert.ok(devHealthData.data.redis.status);
    assert.ok(['DIRECT_DATABASE', 'REDIS_BUFFER'].includes(devHealthData.data.system.operatingMode));
    console.log(`   ✓ Developer GET /api/v1/system/health -> 200 OK (operatingMode: ${devHealthData.data.system.operatingMode})`);

    // Unauthorized access rejection for non-developers
    const adminBlockedRes = await fetch(`${baseUrl}/api/v1/system/health`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(adminBlockedRes.status, 403, 'Admin must be forbidden from accessing Developer telemetry');
    console.log('   ✓ Security Gate Check: Admin blocked from /system/health -> 403 Forbidden');

    const staffBlockedRes = await fetch(`${baseUrl}/api/v1/system/health`, {
      headers: { Authorization: `Bearer ${staffToken}` }
    });
    assert.equal(staffBlockedRes.status, 403, 'Staff must be forbidden from accessing Developer telemetry');
    console.log('   ✓ Security Gate Check: Staff blocked from /system/health -> 403 Forbidden');
  }

  // 9. Audit Trail Verification
  console.log('\n9. Testing Security Audit Logs...');
  {
    const auditRes = await fetch(`${baseUrl}/api/v1/audit-logs?limit=10`, {
      headers: { Authorization: `Bearer ${developerToken}` }
    });
    assert.equal(auditRes.status, 200);
    const auditData = await auditRes.json();
    assert.ok(auditData.data.logs.length > 0);
    console.log(`   ✓ Developer GET /api/v1/audit-logs -> 200 OK (${auditData.data.logs.length} audit records retrieved)`);

    // Non-developer blocked from audit logs
    const adminAuditBlocked = await fetch(`${baseUrl}/api/v1/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(adminAuditBlocked.status, 403, 'Admin must be forbidden from viewing Audit Logs');
    console.log('   ✓ Security Gate Check: Admin blocked from /api/v1/audit-logs -> 403 Forbidden');
  }

  console.log('\n===============================================================');
  console.log('  ALL PRODUCTION VERIFICATION CHECKS PASSED WITH 100% SUCCESS! ');
  console.log('===============================================================\n');
}

runProductionTests()
  .catch((err) => {
    console.error('\n[FATAL TEST FAILURE]', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await disconnectDB();
    await closeRedis();
    process.exit(process.exitCode || 0);
  });
