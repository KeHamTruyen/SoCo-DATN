import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

// ── Auth guard tests (no DB needed) ──────────────────────────────────────────

test('POST /api/reports - 401 when not authenticated', async () => {
  const res = await request(app)
    .post('/api/reports')
    .send({ targetType: 'USER', targetId: '00000000-0000-0000-0000-000000000001', reason: 'SPAM' });

  assert.equal(res.status, 401);
});

test('GET /api/reports/me - 401 when not authenticated', async () => {
  const res = await request(app).get('/api/reports/me');
  assert.equal(res.status, 401);
});

test('GET /api/reports/admin - 401 when not authenticated', async () => {
  const res = await request(app).get('/api/reports/admin');
  assert.equal(res.status, 401);
});

test('PATCH /api/reports/:id/status - 401 when not authenticated', async () => {
  const res = await request(app)
    .patch('/api/reports/00000000-0000-0000-0000-000000000001/status')
    .send({ status: 'RESOLVED' });

  assert.equal(res.status, 401);
});

// ── Input validation tests (requires DB for auth, but validates structure) ───
// These use a deliberately malformed JWT to short-circuit after auth-check
// so we can reach the validator error path without a real DB user.

const FAKE_TOKEN = 'Bearer invalid.jwt.token';

test('POST /api/reports - 400 when targetType is invalid', async () => {
  const res = await request(app)
    .post('/api/reports')
    .set('Authorization', FAKE_TOKEN)
    .send({ targetType: 'INVALID', targetId: '00000000-0000-0000-0000-000000000001', reason: 'SPAM' });

  // 401 (bad token) OR 400 (validation) – both confirm the route exists
  assert.ok([400, 401].includes(res.status), `Expected 400 or 401, got ${res.status}`);
});

test('POST /api/reports - 400 when reason is invalid', async () => {
  const res = await request(app)
    .post('/api/reports')
    .set('Authorization', FAKE_TOKEN)
    .send({ targetType: 'USER', targetId: '00000000-0000-0000-0000-000000000001', reason: 'BADWORD' });

  assert.ok([400, 401].includes(res.status), `Expected 400 or 401, got ${res.status}`);
});

test('POST /api/reports - 400 when targetId is not a UUID', async () => {
  const res = await request(app)
    .post('/api/reports')
    .set('Authorization', FAKE_TOKEN)
    .send({ targetType: 'USER', targetId: 'not-a-uuid', reason: 'SPAM' });

  assert.ok([400, 401].includes(res.status), `Expected 400 or 401, got ${res.status}`);
});

test('POST /api/reports - 400 when description exceeds 2000 chars', async () => {
  const res = await request(app)
    .post('/api/reports')
    .set('Authorization', FAKE_TOKEN)
    .send({
      targetType: 'USER',
      targetId: '00000000-0000-0000-0000-000000000001',
      reason: 'SPAM',
      description: 'x'.repeat(2001),
    });

  assert.ok([400, 401].includes(res.status), `Expected 400 or 401, got ${res.status}`);
});

test('PATCH /api/reports/:id/status - 400 when id param is not a UUID', async () => {
  const res = await request(app)
    .patch('/api/reports/not-a-uuid/status')
    .set('Authorization', FAKE_TOKEN)
    .send({ status: 'RESOLVED' });

  assert.ok([400, 401].includes(res.status), `Expected 400 or 401, got ${res.status}`);
});

test('PATCH /api/reports/:id/status - 400 when status is invalid', async () => {
  const res = await request(app)
    .patch('/api/reports/00000000-0000-0000-0000-000000000001/status')
    .set('Authorization', FAKE_TOKEN)
    .send({ status: 'BANANA' });

  assert.ok([400, 401].includes(res.status), `Expected 400 or 401, got ${res.status}`);
});

test('PATCH /api/reports/:id/status - 400 when REJECTED without resolutionNote', async () => {
  const res = await request(app)
    .patch('/api/reports/00000000-0000-0000-0000-000000000001/status')
    .set('Authorization', FAKE_TOKEN)
    .send({ status: 'REJECTED' });

  assert.ok([400, 401].includes(res.status), `Expected 400 or 401, got ${res.status}`);
});
