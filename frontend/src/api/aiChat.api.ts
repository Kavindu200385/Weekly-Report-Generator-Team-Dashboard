// Real NestJS AiChatModule endpoints (Groq-backed).
import { client, normalizeApiError } from "@/api/client";

export interface AskResponse {
  answer: string;
  contextUsed: string;
}

export interface TeamSummaryResponse {
  summary: string;
  reportsAnalyzed: number;
}

export async function askAi(question: string): Promise<AskResponse> {
  try {
    const { data } = await client.post<AskResponse>("/ai/ask", { question });
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export async function getTeamSummary(week: string): Promise<TeamSummaryResponse> {
  try {
    const { data } = await client.get<TeamSummaryResponse>("/ai/team-summary", { params: { week } });
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}
