// Real NestJS ReportsModule endpoints — replaces the earlier mock array
// held in frontend/src/api/mockData.ts's REPORTS_INIT.
import { client, normalizeApiError } from "@/api/client";

export type ReportStatus = "draft" | "submitted" | "needs_correction" | "approved";

export interface ApiTaskItem { taskName: string; priority: string; plannedPct: number; actualPct: number; status: string; timePlannedHrs: number; timeSpentHrs: number; outputDeliverable?: string }
export interface ApiBlockerItem { description: string; isKeyIssue?: boolean }
export interface ApiAchievementItem { description: string; isKeyAchievement?: boolean }
export interface ApiHoursItem { taskType: string; hours: number }

export interface ApiReport {
  id: number;
  userId: number;
  projectId: number;
  weekStartDate: string;
  weekEndDate: string;
  status: ReportStatus;
  tasksPlannedNextWeek: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  project?: { id: number; name: string };
  user?: { id: number; name: string };
}

export interface ApiReportVersionFull {
  id: number;
  versionNumber: number;
  submittedAt: string | null;
  tasks: (ApiTaskItem & { id: number })[];
  blockers: (ApiBlockerItem & { id: number })[];
  achievements: (ApiAchievementItem & { id: number })[];
  hours: (ApiHoursItem & { id: number })[];
  reviews: { id: number; action: string; comment: string | null; createdAt: string; reviewer?: { id: number; name: string } }[];
}

export interface ApiReportDetail extends ApiReport {
  versions: ApiReportVersionFull[];
}

export interface ApiReportVersionSummary {
  id: number;
  versionNumber: number;
  submittedAt: string | null;
  reviews: { action: string; comment: string | null; createdAt: string }[];
}

export interface PaginatedReports {
  data: ApiReport[];
  total: number;
  page: number;
  limit: number;
}

export interface ReportFilter {
  status?: ReportStatus;
  projectId?: number;
  userId?: number;
  weekStart?: string;
  weekEnd?: string;
  page?: number;
  limit?: number;
}

export interface CreateReportInput {
  projectId: number;
  weekStartDate: string;
  weekEndDate: string;
  tasksPlannedNextWeek?: string;
  notes?: string;
}

export interface UpdateReportInput extends Partial<CreateReportInput> {
  tasks?: ApiTaskItem[];
  blockers?: ApiBlockerItem[];
  achievements?: ApiAchievementItem[];
  hoursByType?: ApiHoursItem[];
}

export async function createReport(input: CreateReportInput): Promise<ApiReport> {
  try {
    const { data } = await client.post<ApiReport>("/reports", input);
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export async function updateReport(id: number, input: UpdateReportInput): Promise<ApiReport> {
  try {
    const { data } = await client.patch<ApiReport>(`/reports/${id}`, input);
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export async function submitReport(id: number): Promise<ApiReport> {
  try {
    const { data } = await client.post<ApiReport>(`/reports/${id}/submit`);
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export async function getMyReports(filter: ReportFilter = {}): Promise<PaginatedReports> {
  try {
    const { data } = await client.get<PaginatedReports>("/reports/me", { params: filter });
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export async function getTeamReports(filter: ReportFilter = {}): Promise<PaginatedReports> {
  try {
    const { data } = await client.get<PaginatedReports>("/reports/team", { params: filter });
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export async function getReport(id: number): Promise<ApiReportDetail> {
  try {
    const { data } = await client.get<ApiReportDetail>(`/reports/${id}`);
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export async function getReportVersions(id: number): Promise<ApiReportVersionSummary[]> {
  try {
    const { data } = await client.get<ApiReportVersionSummary[]>(`/reports/${id}/versions`);
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export async function getReportVersion(id: number, versionId: number): Promise<ApiReportVersionFull> {
  try {
    const { data } = await client.get<ApiReportVersionFull>(`/reports/${id}/versions/${versionId}`);
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}
