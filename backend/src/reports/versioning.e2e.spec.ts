// The most important test in the backend — exercises the full
// draft -> submit -> changes_requested -> edit -> resubmit cycle and
// confirms version history is preserved, not overwritten.
import { ChildProcess } from 'child_process';
import request from 'supertest';
import { spawnServer, waitForHealth, registerMember, loginSeededManager } from '../test-utils/e2e-server';

const PORT = 3095;
const BASE_URL = `http://localhost:${PORT}`;

describe('Submit + versioning (e2e, over HTTP)', () => {
  let server: ChildProcess;
  let memberToken: string;
  let managerToken: string;
  let projectId: number;
  let reportId: number;

  beforeAll(async () => {
    server = spawnServer(PORT);
    await waitForHealth(BASE_URL, 30000);

    memberToken = await registerMember(BASE_URL, `versioning-e2e-${Date.now()}@sitrep.test`);
    managerToken = await loginSeededManager(BASE_URL);

    const projectsRes = await request(BASE_URL).get('/projects').set('Authorization', `Bearer ${memberToken}`);
    projectId = projectsRes.body[0].id;
  }, 40000);

  afterAll(() => {
    if (server && !server.killed) server.kill('SIGTERM');
  });

  it('1. create report, add a task, submit -> version 1 created with submittedAt set', async () => {
    const createRes = await request(BASE_URL)
      .post('/reports')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ projectId, weekStartDate: '2026-09-01', weekEndDate: '2026-09-05' })
      .expect(201);
    reportId = createRes.body.id;

    await request(BASE_URL)
      .patch(`/reports/${reportId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        tasks: [
          {
            taskName: 'Initial task',
            priority: 'high',
            plannedPct: 100,
            actualPct: 50,
            status: 'in-progress',
            timePlannedHrs: 8,
            timeSpentHrs: 4,
          },
        ],
      })
      .expect(200);

    const submitRes = await request(BASE_URL)
      .post(`/reports/${reportId}/submit`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(201);
    expect(submitRes.body.status).toBe('submitted');

    const versions = await request(BASE_URL)
      .get(`/reports/${reportId}/versions`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(200);
    expect(versions.body).toHaveLength(1);
    expect(versions.body[0].versionNumber).toBe(1);
    expect(versions.body[0].submittedAt).not.toBeNull();
  });

  it('2-3. manager requests changes -> report status becomes needs_correction', async () => {
    await request(BASE_URL)
      .post(`/reports/${reportId}/review`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ action: 'changes_requested', comment: 'Please reconcile the hours.' })
      .expect(201);

    const reportRes = await request(BASE_URL)
      .get(`/reports/${reportId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(200);
    expect(reportRes.body.status).toBe('needs_correction');
  });

  it('4. edit the report (version 2, the fresh copy) and submit again', async () => {
    // Confirm version 2 already exists (created automatically by submit()) and
    // was pre-populated with a copy of version 1's task.
    const beforeEdit = await request(BASE_URL)
      .get(`/reports/${reportId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(200);
    const openVersion = beforeEdit.body.versions.find((v: any) => v.submittedAt === null);
    expect(openVersion.tasks).toHaveLength(1);
    expect(openVersion.tasks[0].taskName).toBe('Initial task');

    await request(BASE_URL)
      .patch(`/reports/${reportId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        tasks: [
          {
            taskName: 'Initial task',
            priority: 'high',
            plannedPct: 100,
            actualPct: 100,
            status: 'done',
            timePlannedHrs: 8,
            timeSpentHrs: 8,
          },
        ],
      })
      .expect(200);

    const submitRes = await request(BASE_URL)
      .post(`/reports/${reportId}/submit`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(201);
    expect(submitRes.body.status).toBe('submitted');
  });

  it('5. version 1 still exists, unchanged, fetchable, with its review comment attached', async () => {
    const versionsListRes = await request(BASE_URL)
      .get(`/reports/${reportId}/versions`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(200);
    const v1Summary = versionsListRes.body.find((v: any) => v.versionNumber === 1);
    const v1Id = v1Summary.id;

    const v1Res = await request(BASE_URL)
      .get(`/reports/${reportId}/versions/${v1Id}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(200);

    expect(v1Res.body.tasks).toHaveLength(1);
    expect(v1Res.body.tasks[0].actualPct).toBe(50); // unchanged from before the edit
    expect(v1Res.body.reviews).toHaveLength(1);
    expect(v1Res.body.reviews[0].comment).toBe('Please reconcile the hours.');
  });

  it('6. GET /reports/:id/versions now shows 2 entries', async () => {
    const res = await request(BASE_URL)
      .get(`/reports/${reportId}/versions`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.map((v: any) => v.versionNumber).sort()).toEqual([1, 2]);
  });
});
