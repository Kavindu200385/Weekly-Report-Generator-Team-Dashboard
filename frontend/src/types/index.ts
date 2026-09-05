export type Status = "draft" | "submitted" | "needs_correction" | "approved";
export type Role = "member" | "manager";
export type Priority = "low" | "medium" | "high" | "critical";
export type TaskSt = "not-started" | "in-progress" | "done" | "blocked";

export interface User { id: string; name: string; initials: string; email: string; role: Role; joinedAt: string; }
export interface Project { id: string; name: string; description: string; active: boolean; members: string[]; }
export interface TaskRow { id: string; name: string; priority: Priority; plannedPct: number; actualPct: number; status: TaskSt; timePlanned: number; timeSpent: number; output: string; }
export interface Blocker { id: string; text: string; isKey: boolean; }
export interface Achievement { id: string; text: string; isKey: boolean; }
export interface ReviewEntry { date: string; author: string; comment: string; versionIdx: number; }
export interface ReportVersion { submittedAt: string; tasks: TaskRow[]; nextWeekPlan: string; blockers: Blocker[]; achievements: Achievement[]; hours: HoursData; notes: string; }
export interface HoursData { dev: number; testing: number; meetings: number; docs: number; }
export interface Report {
  id: string; memberId: string; week: string; projectId: string;
  status: Status; versions: ReportVersion[]; reviews: ReviewEntry[];
  tasks: TaskRow[]; nextWeekPlan: string; blockers: Blocker[];
  achievements: Achievement[]; hours: HoursData; notes: string;
}
