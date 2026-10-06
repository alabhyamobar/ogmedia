import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

describe('CORS Configuration & Origin Validation', () => {
  let server;
  let baseUrl;

  before(async () => {
    process.env.NODE_ENV = 'test';
    const app = createApp();
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const address = server.address();
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('Should allow requests from production origin https://ogmedia-theta.vercel.app', async () => {
    const res = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: {
        Origin: 'https://ogmedia-theta.vercel.app'
      }
    });

    assert.equal(res.status, 200);
    assert.equal(res.headers.get('access-control-allow-origin'), 'https://ogmedia-theta.vercel.app');
    assert.equal(res.headers.get('access-control-allow-credentials'), 'true');
  });

  test('Should allow requests when origin has a trailing slash https://ogmedia-theta.vercel.app/', async () => {
    const res = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: {
        Origin: 'https://ogmedia-theta.vercel.app/'
      }
    });

    assert.equal(res.status, 200);
    assert.ok(res.headers.get('access-control-allow-origin'));
    assert.equal(res.headers.get('access-control-allow-credentials'), 'true');
  });

  test('Should respond with CORS headers on OPTIONS preflight request for https://ogmedia-theta.vercel.app', async () => {
    const res = await fetch(`${baseUrl}/api/v1/public/leads`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://ogmedia-theta.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, X-Request-Id'
      }
    });

    assert.ok(res.status === 204 || res.status === 200, `Expected 204 or 200, got ${res.status}`);
    assert.equal(res.headers.get('access-control-allow-origin'), 'https://ogmedia-theta.vercel.app');
    assert.equal(res.headers.get('access-control-allow-credentials'), 'true');
    const allowMethods = res.headers.get('access-control-allow-methods') || '';
    assert.ok(allowMethods.includes('POST'), 'Should allow POST method');
  });

  test('Should allow Vercel preview deployments matching pattern https://ogmedia-*.vercel.app', async () => {
    const res = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: {
        Origin: 'https://ogmedia-feature-preview.vercel.app'
      }
    });

    assert.equal(res.status, 200);
    assert.equal(res.headers.get('access-control-allow-origin'), 'https://ogmedia-feature-preview.vercel.app');
    assert.equal(res.headers.get('access-control-allow-credentials'), 'true');
  });

  test('Should allow server-to-server or curl requests with no Origin header', async () => {
    const res = await fetch(`${baseUrl}/health`, {
      method: 'GET'
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'OK');
  });

  test('Should reject requests from unauthorized origins', async () => {
    const res = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: {
        Origin: 'https://unauthorized-malicious-domain.com'
      }
    });

    // When CORS rejects, it responds with an error status or lacks CORS headers
    assert.ok(
      res.status >= 400 || !res.headers.has('access-control-allow-origin'),
      'Unauthorized origin should be blocked'
    );
  });
});
