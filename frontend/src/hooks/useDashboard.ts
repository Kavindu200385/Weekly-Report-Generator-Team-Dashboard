import { useQuery } from "@tanstack/react-query";
import {
  getDashboardSummary,
  getTeamStatus,
  getTasksTrend,
  getWorkloadByProject,
  getTimeByType,
  getActivityFeed,
  getSectionView,
} from "@/api/dashboard.api";

export const useDashboardSummary = (week: string) =>
  useQuery({ queryKey: ["dashboard", "summary", week], queryFn: () => getDashboardSummary(week) });

export const useTeamStatus = (week: string) =>
  useQuery({ queryKey: ["dashboard", "team-status", week], queryFn: () => getTeamStatus(week) });

export const useTasksTrend = (weeks = 8) =>
  useQuery({ queryKey: ["dashboard", "tasks-trend", weeks], queryFn: () => getTasksTrend(weeks) });

export const useWorkloadByProject = (week: string) =>
  useQuery({ queryKey: ["dashboard", "workload-by-project", week], queryFn: () => getWorkloadByProject(week) });

export const useTimeByType = (week: string) =>
  useQuery({ queryKey: ["dashboard", "time-by-type", week], queryFn: () => getTimeByType(week) });

export const useActivityFeed = (limit = 10) =>
  useQuery({ queryKey: ["dashboard", "activity-feed", limit], queryFn: () => getActivityFeed(limit) });

export const useSectionView = (week: string, section: "blockers" | "achievements") =>
  useQuery({ queryKey: ["dashboard", "section-view", week, section], queryFn: () => getSectionView(week, section) });
