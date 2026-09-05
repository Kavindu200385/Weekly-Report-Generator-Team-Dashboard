import { ChildProcess } from 'child_process';
import request from 'supertest';
import { spawnServer, waitForHealth, registerMember } from '../test-utils/e2e-server';

const PORT = 3094;
const BASE_URL = `http://localhost:${PORT}`;

describe('Reviews RBAC (e2e, over HTTP)', () => {
  let server: ChildProcess;
  let memberToken: string;
  let projectId: number;
  let reportId: number;

  beforeAll(async () => {
    server = spawnServer(PORT);
    await waitForHealth(BASE_URL, 30000);

    memberToken = await registerMember(BASE_URL, `reviews-e2e-${Date.now()}@sitrep.test`);

    const projectsRes = await request(BASE_URL).get('/projects').set('Authorization', `Bearer ${memberToken}`);
    projectId = projectsRes.body[0].id;

    const createRes = await request(BASE_URL)
      .post('/reports')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ projectId, weekStartDate: '2026-09-01', weekEndDate: '2026-09-05' })
      .expect(201);
    reportId = createRes.body.id;

    await request(BASE_URL)
      .post(`/reports/${reportId}/submit`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(201);
  }, 40000);

  afterAll(() => {
    if (server && !server.killed) server.kill('SIGTERM');
  });

  it('member role gets 403 on POST /reports/:id/review even for their own report', async () => {
    await request(BASE_URL)
      .post(`/reports/${reportId}/review`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ action: 'approved' })
      .expect(403);
  });
});
