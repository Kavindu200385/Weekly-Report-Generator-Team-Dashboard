// Real NestJS DashboardModule endpoints — replaces the earlier mock
// TREND/WORKLOAD/TIME_TYPE arrays from frontend/src/api/mockData.ts.
import { client, normalizeApiError } from "@/api/client";

export interface DashboardSummary {
  totalSubmitted: number;
  complianceRate: number;
  needsCorrectionCount: number;
  openBlockersCount: number;
}

export type TeamMemberStatus = "draft" | "submitted" | "needs_correction" | "approved" | "not_started";

export interface TeamStatusRow {
  userId: number;
  name: string;
  status: TeamMemberStatus;
}

export interface TasksTrendPoint {
  week: string;
  count: number;
}

export interface WorkloadByProjectRow {
  projectId: number;
  projectName: string;
  taskCount: number;
  totalHours: number;
}

export interface TimeByTypeRow {
  taskType: string;
  totalHours: number;
}

export interface ActivityFeedEntry {
  timestamp: string;
  userId: number;
  userName: string;
  type: "submission" | "review";
  action?: string;
}

export interface SectionViewEntry {
  userId: number;
  name: string;
  entries: { description: string; isKeyIssue?: boolean; isKeyAchievement?: boolean }[];
}

async function get<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  try {
    const { data } = await client.get<T>(path, { params });
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export const getDashboardSummary = (week: string) => get<DashboardSummary>("/dashboard/summary", { week });
export const getTeamStatus = (week: string) => get<TeamStatusRow[]>("/dashboard/team-status", { week });
export const getTasksTrend = (weeks = 8) => get<TasksTrendPoint[]>("/dashboard/tasks-trend", { weeks });
export const getWorkloadByProject = (week: string) => get<WorkloadByProjectRow[]>("/dashboard/workload-by-project", { week });
export const getTimeByType = (week: string) => get<TimeByTypeRow[]>("/dashboard/time-by-type", { week });
export const getActivityFeed = (limit = 10) => get<ActivityFeedEntry[]>("/dashboard/activity-feed", { limit });
export const getSectionView = (week: string, section: "blockers" | "achievements") =>
  get<SectionViewEntry[]>("/dashboard/section-view", { week, section });
