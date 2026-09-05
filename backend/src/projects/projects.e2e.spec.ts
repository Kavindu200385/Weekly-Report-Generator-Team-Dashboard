// Same spawn-a-real-server + supertest pattern as src/auth/auth.e2e.spec.ts:
// @nestjs/* ships ESM-only in this project ("type": "module" in their
// package.json), which `nest start` handles fine via webpack but Jest's
// CJS runtime cannot require() directly. Driving the test over real HTTP
// against a spawned `nest start` process sidesteps that entirely.
import { ChildProcess, spawn } from 'child_process';
import request from 'supertest';

const PORT = 3097;
const BASE_URL = `http://localhost:${PORT}`;

function waitForHealth(timeoutMs: number): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = async () => {
      try {
        const res = await request(BASE_URL).get('/health');
        if (res.status === 200) {
          resolve();
          return;
        }
      } catch {
        // server not up yet
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error('Server did not become healthy in time'));
        return;
      }
      setTimeout(attempt, 500);
    };
    attempt();
  });
}

async function registerMember(email: string): Promise<string> {
  const res = await request(BASE_URL)
    .post('/auth/register')
    .send({ name: 'E2E member', email, password: 'Password123!', recaptchaToken: 'bypass-test-token' })
    .expect(201);
  return res.body.token;
}

async function loginSeededManager(): Promise<string> {
  // register() always creates a "member" — to test manager-only routes we
  // use the seeded manager@sitrep.test account instead of trying to
  // escalate a freshly registered user.
  const res = await request(BASE_URL)
    .post('/auth/login')
    .send({ email: 'manager@sitrep.test', password: 'Password123!', recaptchaToken: 'bypass-test-token' })
    .expect(200);
  return res.body.token;
}

describe('Projects (e2e, over HTTP)', () => {
  let server: ChildProcess;
  let memberToken: string;
  let managerToken: string;

  beforeAll(async () => {
    server = spawn('npx', ['nest', 'start'], {
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: 'test', PORT: String(PORT) },
      stdio: 'ignore',
    });
    await waitForHealth(30000);

    memberToken = await registerMember(`projects-e2e-member-${Date.now()}@sitrep.test`);
    managerToken = await loginSeededManager();
  }, 40000);

  afterAll(() => {
    if (server && !server.killed) {
      server.kill('SIGTERM');
    }
  });

  it('returns 403 when a member tries to create a project', async () => {
    await request(BASE_URL)
      .post('/projects')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ name: `Member Attempt ${Date.now()}` })
      .expect(403);
  });

  let createdProjectId: number;
  const projectName = `E2E Project ${Date.now()}`;

  it('lets a manager create a project', async () => {
    const res = await request(BASE_URL)
      .post('/projects')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ name: projectName, description: 'Created by e2e test' })
      .expect(201);

    expect(res.body).toMatchObject({ name: projectName, isActive: true });
    createdProjectId = res.body.id;
  });

  it('does not return inactive projects to a member even with includeInactive=true', async () => {
    // Deactivate the just-created project as manager first.
    await request(BASE_URL)
      .patch(`/projects/${createdProjectId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ isActive: false })
      .expect(200);

    const res = await request(BASE_URL)
      .get('/projects?includeInactive=true')
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(200);

    const names = res.body.map((p: { name: string }) => p.name);
    expect(names).not.toContain(projectName);
  });
});
