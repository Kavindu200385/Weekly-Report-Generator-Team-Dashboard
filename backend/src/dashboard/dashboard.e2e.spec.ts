import { ChildProcess } from 'child_process';
import request from 'supertest';
import { spawnServer, waitForHealth, registerMember } from '../test-utils/e2e-server';

const PORT = 3092;
const BASE_URL = `http://localhost:${PORT}`;

describe('Dashboard RBAC (e2e, over HTTP)', () => {
  let server: ChildProcess;
  let memberToken: string;

  beforeAll(async () => {
    server = spawnServer(PORT);
    await waitForHealth(BASE_URL, 30000);
    memberToken = await registerMember(BASE_URL, `dashboard-e2e-${Date.now()}@sitrep.test`);
  }, 40000);

  afterAll(() => {
    if (server && !server.killed) server.kill('SIGTERM');
  });

  it('member role gets 403 on GET /dashboard/summary', async () => {
    await request(BASE_URL)
      .get('/dashboard/summary?week=2026-09-01')
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(403);
  });
});
