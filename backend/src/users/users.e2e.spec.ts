import { ChildProcess } from 'child_process';
import request from 'supertest';
import { spawnServer, waitForHealth, registerMember } from '../test-utils/e2e-server';

const PORT = 3093;
const BASE_URL = `http://localhost:${PORT}`;

describe('Users RBAC (e2e, over HTTP)', () => {
  let server: ChildProcess;
  let memberToken: string;

  beforeAll(async () => {
    server = spawnServer(PORT);
    await waitForHealth(BASE_URL, 30000);
    memberToken = await registerMember(BASE_URL, `users-e2e-${Date.now()}@sitrep.test`);
  }, 40000);

  afterAll(() => {
    if (server && !server.killed) server.kill('SIGTERM');
  });

  it('member role gets 403 on GET /users', async () => {
    await request(BASE_URL).get('/users').set('Authorization', `Bearer ${memberToken}`).expect(403);
  });

  it('member role gets 403 on PATCH /users/:id/role', async () => {
    await request(BASE_URL)
      .patch('/users/1/role')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ role: 'manager' })
      .expect(403);
  });

  it('member role gets 403 on DELETE /users/:id', async () => {
    await request(BASE_URL).delete('/users/1').set('Authorization', `Bearer ${memberToken}`).expect(403);
  });

  it('member role gets 403 on GET /users/:id/profile', async () => {
    await request(BASE_URL).get('/users/1/profile').set('Authorization', `Bearer ${memberToken}`).expect(403);
  });
});
