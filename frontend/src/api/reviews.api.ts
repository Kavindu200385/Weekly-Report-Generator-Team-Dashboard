// Real NestJS ReviewsModule endpoints.
import { client, normalizeApiError } from "@/api/client";

export type ReviewAction = "approved" | "changes_requested";

export interface ApiReviewHistoryEntry {
  versionNumber: number;
  reviewer: { id: number; name: string };
  action: ReviewAction;
  comment: string | null;
  createdAt: string;
}

export async function createReview(
  reportId: number,
  input: { action: ReviewAction; comment?: string },
) {
  try {
    const { data } = await client.post(`/reports/${reportId}/review`, input);
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export async function getReportReviews(reportId: number): Promise<ApiReviewHistoryEntry[]> {
  try {
    const { data } = await client.get<ApiReviewHistoryEntry[]>(`/reports/${reportId}/reviews`);
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}
