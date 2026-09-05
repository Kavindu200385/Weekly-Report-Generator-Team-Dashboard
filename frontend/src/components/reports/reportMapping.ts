import type { ApiReportDetail, ApiReportVersionFull, UpdateReportInput } from "@/api/reports.api";
import type { ReportContent, LatestReview } from "@/components/reports/ReportBody";

export function blankContent(projectId: number | ""): ReportContent {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7));
  const weekStartDate = monday.toISOString().slice(0, 10);
  const weekEndDate = new Date(monday.getTime() + 4 * 86400000).toISOString().slice(0, 10);
  return {
    weekStartDate, weekEndDate, projectId,
    tasksPlannedNextWeek: "", notes: "",
    tasks: [], blockers: [], achievements: [], hoursByType: [],
  };
}

/** The version currently open for editing — highest versionNumber (matches backend's convention). */
export function getCurrentVersion(report: ApiReportDetail): ApiReportVersionFull | undefined {
  return [...report.versions].sort((a, b) => b.versionNumber - a.versionNumber)[0];
}

export function versionToContent(report: ApiReportDetail, version: ApiReportVersionFull): ReportContent {
  return {
    weekStartDate: report.weekStartDate,
    weekEndDate: report.weekEndDate,
    projectId: report.projectId,
    tasksPlannedNextWeek: report.tasksPlannedNextWeek ?? "",
    notes: report.notes ?? "",
    tasks: version.tasks.map(t => ({
      id: String(t.id), taskName: t.taskName, priority: t.priority, plannedPct: t.plannedPct,
      actualPct: t.actualPct, status: t.status, timePlannedHrs: Number(t.timePlannedHrs),
      timeSpentHrs: Number(t.timeSpentHrs), outputDeliverable: t.outputDeliverable ?? "",
    })),
    blockers: version.blockers.map(b => ({ id: String(b.id), description: b.description, isKeyFlag: !!b.isKeyIssue })),
    achievements: version.achievements.map(a => ({ id: String(a.id), description: a.description, isKeyFlag: !!a.isKeyAchievement })),
    hoursByType: version.hours.map(h => ({ id: String(h.id), taskType: h.taskType, hours: Number(h.hours) })),
  };
}

export function contentToUpdateInput(content: ReportContent): UpdateReportInput {
  return {
    projectId: content.projectId === "" ? undefined : content.projectId,
    weekStartDate: content.weekStartDate,
    weekEndDate: content.weekEndDate,
    tasksPlannedNextWeek: content.tasksPlannedNextWeek,
    notes: content.notes,
    tasks: content.tasks.map(({ id: _id, ...rest }) => rest),
    blockers: content.blockers.map(b => ({ description: b.description, isKeyIssue: b.isKeyFlag })),
    achievements: content.achievements.map(a => ({ description: a.description, isKeyAchievement: a.isKeyFlag })),
    hoursByType: content.hoursByType.map(h => ({ taskType: h.taskType, hours: h.hours })),
  };
}

export function getMostRecentReview(report: ApiReportDetail): LatestReview | null {
  // A review only reflects the report's *current* state while it's sitting
  // in needs_correction or approved — once resubmitted (back to submitted),
  // the old review is stale and must not render as if it were still current.
  if (report.status !== "needs_correction" && report.status !== "approved") return null;
  const all = report.versions.flatMap(v => v.reviews.map(r => ({ ...r })));
  if (!all.length) return null;
  all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const latest = all[0];
  return {
    status: latest.action === "approved" ? "approved" : "needs_correction",
    comment: latest.comment,
    date: latest.createdAt.slice(0, 16).replace("T", " "),
    author: latest.reviewer?.name ?? "Manager",
  };
}
