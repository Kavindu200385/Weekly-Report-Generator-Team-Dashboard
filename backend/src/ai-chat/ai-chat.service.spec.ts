// Unit test against the framework-free logic in ai-chat.logic.ts, with a
// hand-rolled fake Groq client — no real network call, no rate-limit risk.
// This is *not* a full AiChatService test: AiChatService itself imports
// @nestjs/common/typeorm/config, which ship ESM-only in this project and
// can't be require()'d by Jest (the same constraint behind every other
// *.e2e.spec.ts file here spawning a real server instead). Extracting the
// context-formatting/Groq-calling logic into a Nest-free module is what
// makes it possible to unit-test at all under that constraint.
import {
  AiUnavailableError,
  GroqLike,
  ReportLike,
  buildContextString,
  callGroq,
  detectEntities,
  detectTimeframe,
} from './ai-chat.logic';

const fakeReports: ReportLike[] = [
  {
    status: 'submitted',
    project: { name: 'Client A' },
    user: { name: 'Maya Chen' },
    versions: [
      {
        versionNumber: 1,
        tasks: [{ taskName: 'API rate limiter' }],
        blockers: [{ description: 'Vendor API rate limits' }],
        achievements: [{ description: 'Shipped ahead of schedule' }],
      },
    ],
  },
];

describe('ai-chat.logic (unit, mocked Groq)', () => {
  it('buildContextString formats reports as readable bullet lines', () => {
    const context = buildContextString(fakeReports);
    expect(context).toBe(
      '- Maya Chen on Client A (submitted): completed API rate limiter, blocker: Vendor API rate limits, achievement: Shipped ahead of schedule',
    );
  });

  it('buildContextString handles an empty report list', () => {
    expect(buildContextString([])).toBe('No reports found for this scope.');
  });

  it('detectEntities matches a project/member name mentioned in the question (case-insensitive)', () => {
    const projects = [{ name: 'Client A' }, { name: 'Internal Tooling' }];
    const users = [{ name: 'Maya Chen' }, { name: 'James Park' }];

    expect(detectEntities('What did MAYA CHEN work on for client a?', projects)?.name).toBe('Client A');
    expect(detectEntities('What did MAYA CHEN work on for client a?', users)?.name).toBe('Maya Chen');
    expect(detectEntities('anything unrelated', projects)).toBeUndefined();
  });

  it('detectTimeframe recognizes "last week" / "this week", defaults otherwise', () => {
    expect(detectTimeframe('What happened last week?')).toBe('last-week');
    expect(detectTimeframe('Any blockers this week?')).toBe('this-week');
    expect(detectTimeframe('Any blockers?')).toBe('default');
  });

  it('callGroq returns the mocked model response content', async () => {
    const mockGroq: GroqLike = {
      chat: {
        completions: {
          create: async (params: any) => {
            expect(params.model).toBe('test-model');
            expect(params.max_tokens).toBe(1024);
            expect(params.messages).toHaveLength(2);
            return { choices: [{ message: { content: 'Mocked answer text.' } }] };
          },
        },
      },
    };

    const result = await callGroq(mockGroq, 'test-model', 'system prompt', 'user prompt');
    expect(result).toBe('Mocked answer text.');
  });

  it('callGroq throws AiUnavailableError when the SDK call fails', async () => {
    const failingGroq: GroqLike = {
      chat: { completions: { create: async () => { throw new Error('rate limited'); } } },
    };

    await expect(callGroq(failingGroq, 'test-model', 'sys', 'user')).rejects.toBeInstanceOf(AiUnavailableError);
  });
});
