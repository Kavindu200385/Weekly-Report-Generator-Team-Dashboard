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

export async function registerMember(baseUrl: string, email: string, name = 'E2E member'): Promise<string> {
  const res = await request(baseUrl)
    .post('/auth/register')
    .send({ name, email, password: 'Password123!', recaptchaToken: 'bypass-test-token' })
    .expect(201);
  return res.body.token;
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
