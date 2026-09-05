import { ChildProcess } from 'child_process';
import request from 'supertest';
import { spawnServer, waitForHealth, registerMember, loginSeededManager } from '../test-utils/e2e-server';
import dataSource from '../database/data-source';
import { Report, ReportStatus } from './entities/report.entity';

const PORT = 3096;
const BASE_URL = `http://localhost:${PORT}`;

describe('Reports CRUD (e2e, over HTTP)', () => {
  let server: ChildProcess;
  let tokenA: string;
  let tokenB: string;
  let managerToken: string;
  let projectId: number;

  beforeAll(async () => {
    server = spawnServer(PORT);
    await waitForHealth(BASE_URL, 30000);

    tokenA = await registerMember(BASE_URL, `reports-e2e-a-${Date.now()}@sitrep.test`);
    tokenB = await registerMember(BASE_URL, `reports-e2e-b-${Date.now()}@sitrep.test`);
    managerToken = await loginSeededManager(BASE_URL);

    const projectsRes = await request(BASE_URL).get('/projects').set('Authorization', `Bearer ${tokenA}`);
    projectId = projectsRes.body[0].id;

    await dataSource.initialize();
  }, 40000);

  afterAll(async () => {
    if (dataSource.isInitialized) await dataSource.destroy();
    if (server && !server.killed) server.kill('SIGTERM');
  });

  let reportAId: number;

  it('1. Member A creates a report -> 201, status draft', async () => {
    const res = await request(BASE_URL)
      .post('/reports')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ projectId, weekStartDate: '2026-09-01', weekEndDate: '2026-09-05' })
      .expect(201);

    expect(res.body.status).toBe('draft');
    reportAId = res.body.id;
  });

  it('2. Member A PATCH on Member B\'s report -> 403 (create a report as B first)', async () => {
    const bReport = await request(BASE_URL)
      .post('/reports')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ projectId, weekStartDate: '2026-09-01', weekEndDate: '2026-09-05' })
      .expect(201);

    await request(BASE_URL)
      .patch(`/reports/${bReport.body.id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ notes: 'trying to edit someone else\'s report' })
      .expect(403);
  });

  it('3. Member A PATCH own report after status is manually set to approved -> 403', async () => {
    await dataSource.getRepository(Report).update({ id: reportAId }, { status: ReportStatus.APPROVED });

    await request(BASE_URL)
      .patch(`/reports/${reportAId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ notes: 'should be rejected' })
      .expect(403);

    // reset back to draft so later tests in this file aren't affected
    await dataSource.getRepository(Report).update({ id: reportAId }, { status: ReportStatus.DRAFT });
  });

  it('4. Blockers array with two isKeyIssue:true -> 400', async () => {
    await request(BASE_URL)
      .patch(`/reports/${reportAId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        blockers: [
          { description: 'Blocker one', isKeyIssue: true },
          { description: 'Blocker two', isKeyIssue: true },
        ],
      })
      .expect(400);
  });

  it('5. Manager PATCH on a member\'s report (content edit) -> 403', async () => {
    await request(BASE_URL)
      .patch(`/reports/${reportAId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ notes: 'manager should not be able to edit content' })
      .expect(403);
  });

  it('6. GET /reports/:id as owner -> 200 full content', async () => {
    const res = await request(BASE_URL)
      .get(`/reports/${reportAId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);

    expect(res.body.id).toBe(reportAId);
    expect(Array.isArray(res.body.versions)).toBe(true);
  });

  it('7. GET /reports/:id as manager (not owner) -> 200', async () => {
    await request(BASE_URL)
      .get(`/reports/${reportAId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);
  });

  it('8. GET /reports/:id as different member (not owner, not manager) -> 403', async () => {
    await request(BASE_URL)
      .get(`/reports/${reportAId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(403);
  });
});
