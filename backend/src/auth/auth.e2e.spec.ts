// This test drives the API over real HTTP against a spawned server instance
// rather than importing Nest's TestingModule in-process. Reason: @nestjs/*
// packages in this project ship as ESM-only (`"type": "module"` in their
// package.json), which `nest build`/`nest start` handle fine via webpack,
// but Jest's CJS test runtime cannot `require()` directly. Spawning the
// already-proven-working `nest start` process and talking to it over HTTP
// sidesteps that without needing a Jest ESM/babel transform pipeline.
import { ChildProcess, spawn } from 'child_process';
import request from 'supertest';

const PORT = 3098;
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

describe('Auth (e2e, over HTTP)', () => {
  let server: ChildProcess;
  const email = `auth-e2e-${Date.now()}@sitrep.test`;
  const password = 'Password123!';
  let token: string;

  beforeAll(async () => {
    server = spawn('npx', ['nest', 'start'], {
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: 'test', PORT: String(PORT) },
      stdio: 'ignore',
    });
    await waitForHealth(30000);
  }, 40000);

  afterAll(() => {
    if (server && !server.killed) {
      server.kill('SIGTERM');
    }
  });

  it('registers a new user with a bypassed recaptcha token', async () => {
    const res = await request(BASE_URL)
      .post('/auth/register')
      .send({
        name: 'Auth E2E User',
        email,
        password,
        recaptchaToken: 'bypass-test-token',
      })
      .expect(201);

    expect(res.body.token).toBeDefined();
    expect(res.body.user).toMatchObject({ email, role: 'member' });
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('logs in with the same credentials', async () => {
    const res = await request(BASE_URL)
      .post('/auth/login')
      .send({ email, password, recaptchaToken: 'bypass-test-token' })
      .expect(200);

    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('returns the current user profile for GET /auth/me with a valid token', async () => {
    const res = await request(BASE_URL)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toMatchObject({ email, role: 'member' });
  });

  it('returns 401 for GET /auth/me with no token', async () => {
    await request(BASE_URL).get('/auth/me').expect(401);
  });
});
