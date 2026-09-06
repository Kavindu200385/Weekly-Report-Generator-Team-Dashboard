import { useQuery } from "@tanstack/react-query";
import {
  getDashboardSummary,
  getTeamStatus,
  getTasksTrend,
  getWorkloadByProject,
  getTimeByType,
  getActivityFeed,
  getSectionView,
  type DashboardFilter,
} from "@/api/dashboard.api";

export const useDashboardSummary = (week: string, filter: DashboardFilter = {}) =>
  useQuery({ queryKey: ["dashboard", "summary", week, filter], queryFn: () => getDashboardSummary(week, filter) });

export const useTeamStatus = (week: string) =>
  useQuery({ queryKey: ["dashboard", "team-status", week], queryFn: () => getTeamStatus(week) });

export const useTasksTrend = (weeks = 8) =>
  useQuery({ queryKey: ["dashboard", "tasks-trend", weeks], queryFn: () => getTasksTrend(weeks) });

export const useWorkloadByProject = (week: string, filter: DashboardFilter = {}) =>
  useQuery({ queryKey: ["dashboard", "workload-by-project", week, filter], queryFn: () => getWorkloadByProject(week, filter) });

export const useTimeByType = (week: string, filter: DashboardFilter = {}) =>
  useQuery({ queryKey: ["dashboard", "time-by-type", week, filter], queryFn: () => getTimeByType(week, filter) });

export const useActivityFeed = (limit = 10) =>
  useQuery({ queryKey: ["dashboard", "activity-feed", limit], queryFn: () => getActivityFeed(limit) });

export const useSectionView = (week: string, section: "blockers" | "achievements", filter: DashboardFilter = {}) =>
  useQuery({ queryKey: ["dashboard", "section-view", week, section, filter], queryFn: () => getSectionView(week, section, filter) });
