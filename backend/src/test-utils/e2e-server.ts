// Shared spawn-a-real-server + supertest-over-HTTP helper, reused across
// every *.e2e.spec.ts file. Reason for this pattern (not in-process
// Test.createTestingModule): @nestjs/* ships ESM-only in this project
// ("type": "module" in their package.json) — `nest start` handles that
// fine via webpack, but Jest's CJS runtime cannot require() it directly.
import { ChildProcess, spawn } from 'child_process';
import request from 'supertest';

export function waitForHealth(baseUrl: string, timeoutMs: number): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = async () => {
      try {
        const res = await request(baseUrl).get('/health');
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

export function spawnServer(port: number): ChildProcess {
  return spawn('npx', ['nest', 'start'], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: 'test', PORT: String(port) },
    stdio: 'ignore',
  });
}

// Uninvited self-registration now lands the account in a pending-approval
// state with no token (see AuthService.register) — a manager has to
// approve it before it can log in. Registering an e2e test member is
// therefore a 3-step dance: register (pending), approve as the seeded
// manager, then log in for a real token — while keeping this helper's
// signature/behavior (a ready-to-use member token) unchanged for callers.
export async function registerMember(baseUrl: string, email: string, name = 'E2E member'): Promise<string> {
  await request(baseUrl)
    .post('/auth/register')
    .send({ name, email, password: 'Password123!', recaptchaToken: 'bypass-test-token' })
    .expect(201);

  const managerToken = await loginSeededManager(baseUrl);

  const pending = await request(baseUrl)
    .get('/users/pending-registrations')
    .set('Authorization', `Bearer ${managerToken}`)
    .expect(200);
  const pendingUser = pending.body.find((u: { email: string }) => u.email === email);
  if (!pendingUser) {
    throw new Error(`Expected a pending registration for ${email}, found none.`);
  }

  await request(baseUrl)
    .patch(`/users/${pendingUser.id}/approve`)
    .set('Authorization', `Bearer ${managerToken}`)
    .send({ role: 'member' })
    .expect(200);

  return loginSeededMember(baseUrl, email);
}

export async function loginSeededManager(baseUrl: string): Promise<string> {
  const res = await request(baseUrl)
    .post('/auth/login')
    .send({ email: 'manager@sitrep.test', password: 'Password123!', recaptchaToken: 'bypass-test-token' })
    .expect(200);
  return res.body.token;
}

export async function loginSeededMember(baseUrl: string, email: string): Promise<string> {
  const res = await request(baseUrl)
    .post('/auth/login')
    .send({ email, password: 'Password123!', recaptchaToken: 'bypass-test-token' })
    .expect(200);
  return res.body.token;
}
