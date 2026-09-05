// These two checks never reach the Groq client (guards/DTO validation run
// first), so they use the normal spawn-real-server pattern with no mocking
// needed. The "mocked SDK -> expected shape" case lives in
// ai-chat.service.spec.ts instead, since a Jest mock can't be injected into
// this separately-spawned child process.
import { ChildProcess } from 'child_process';
import request from 'supertest';
import { spawnServer, waitForHealth, registerMember, loginSeededManager } from '../test-utils/e2e-server';

const PORT = 3091;
const BASE_URL = `http://localhost:${PORT}`;

describe('AiChat RBAC + validation (e2e, over HTTP)', () => {
  let server: ChildProcess;
  let memberToken: string;
  let managerToken: string;

  beforeAll(async () => {
    server = spawnServer(PORT);
    await waitForHealth(BASE_URL, 30000);
    memberToken = await registerMember(BASE_URL, `aichat-e2e-${Date.now()}@sitrep.test`);
    managerToken = await loginSeededManager(BASE_URL);
  }, 40000);

  afterAll(() => {
    if (server && !server.killed) server.kill('SIGTERM');
  });

  it('member role gets 403 on POST /ai/ask', async () => {
    await request(BASE_URL)
      .post('/ai/ask')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ question: 'What happened this week?' })
      .expect(403);
  });

  it('member role gets 403 on GET /ai/team-summary', async () => {
    await request(BASE_URL)
      .get('/ai/team-summary?week=2026-08-24')
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(403);
  });

  it('POST /ai/ask with an empty question gets 400', async () => {
    await request(BASE_URL)
      .post('/ai/ask')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ question: '' })
      .expect(400);
  });
});
