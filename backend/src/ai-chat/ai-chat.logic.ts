// Framework-free logic (no @nestjs/* imports) so it can be unit-tested
// directly in Jest — @nestjs/common/typeorm/config all ship ESM-only in
// this project and can't be require()'d by Jest, same constraint that
// shapes every other *.e2e.spec.ts file here to spawn a real server instead.
// AiChatService (Nest-decorated) is a thin wrapper around these functions.

export interface GroqLike {
  chat: {
    completions: {
      create: (params: any) => Promise<{ choices: { message: { content: string | null } }[] }>;
    };
  };
}

/** Thrown by callGroq on any SDK/network failure — translated to an HTTP 502 by the Nest layer. */
export class AiUnavailableError extends Error {
  constructor(public readonly cause: unknown) {
    super('AI assistant is temporarily unavailable');
  }
}

export interface ReportLike {
  status: string;
  project: { name: string };
  user: { name: string };
  versions: {
    versionNumber: number;
    tasks: { taskName: string }[];
    blockers: { description: string }[];
    achievements: { description: string }[];
  }[];
}

export function formatReportLine(r: ReportLike): string {
  const latestVersion = [...(r.versions ?? [])].sort((a, b) => b.versionNumber - a.versionNumber)[0];
  const taskNames = latestVersion?.tasks?.length
    ? latestVersion.tasks.map((t) => t.taskName).join(', ')
    : 'none recorded';
  const blockerText = latestVersion?.blockers?.[0]?.description ?? 'none';
  const achievementText = latestVersion?.achievements?.[0]?.description ?? 'none';
  return `- ${r.user.name} on ${r.project.name} (${r.status}): completed ${taskNames}, blocker: ${blockerText}, achievement: ${achievementText}`;
}

export function buildContextString(reports: ReportLike[]): string {
  if (!reports.length) return 'No reports found for this scope.';
  return reports.map(formatReportLine).join('\n');
}

export function mondayOf(weeksAgo: number): string {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - diffToMonday - weeksAgo * 7);
  return monday.toISOString().slice(0, 10);
}

export type Timeframe = 'this-week' | 'last-week' | 'default';

export function detectTimeframe(question: string): Timeframe {
  const ql = question.toLowerCase();
  if (ql.includes('last week')) return 'last-week';
  if (ql.includes('this week')) return 'this-week';
  return 'default';
}

export function detectEntities<T extends { name: string }>(question: string, candidates: T[]): T | undefined {
  const ql = question.toLowerCase();
  return candidates.find((c) => ql.includes(c.name.toLowerCase()));
}

export async function callGroq(
  groq: GroqLike,
  model: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  try {
    const response = await groq.chat.completions.create({
      model,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });
    return response.choices[0]?.message?.content ?? '';
  } catch (err) {
    throw new AiUnavailableError(err);
  }
}

export const SYSTEM_PROMPT_ASK =
  "You are an assistant for a team manager reviewing weekly work reports. Answer based ONLY on the report data provided in the context. If the data doesn't contain enough information to answer, say so honestly rather than guessing or inventing details. Be concise and specific — reference actual task names, blockers, or people mentioned in the context when relevant.";

export const SYSTEM_PROMPT_SUMMARY =
  "You are summarizing a team's weekly work reports for their manager. Produce a short structured summary with exactly three sections: 'Completed Work' (bullet points of what got done, grouped by project if useful), 'Recurring Blockers' (any blocker themes that appear more than once, or notable individual blockers), and 'Workload Notes' (call out any team member who appears significantly over or under-loaded compared to others this week, based on task count or hours if available). Base this ONLY on the provided report data.";
