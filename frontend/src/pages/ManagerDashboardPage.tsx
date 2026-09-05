import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useDashboardSummary,
  useTeamStatus,
  useTasksTrend,
  useWorkloadByProject,
  useTimeByType,
  useActivityFeed,
  useSectionView,
} from "@/hooks/useDashboard";
import { useTeamReports } from "@/hooks/useReviews";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MetricCard, TINTS } from "@/components/ui/MetricCard";
import { Avatar } from "@/components/ui/Avatar";
import { Sm } from "@/components/ui/Sm";
import { TrendLineChart } from "@/components/dashboard/TrendLineChart";
import { StatusStackedBarChart } from "@/components/dashboard/StatusStackedBarChart";
import { WorkloadBarChart } from "@/components/dashboard/WorkloadBarChart";
import { TimeTypeBarChart } from "@/components/dashboard/TimeTypeBarChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";

const PROJECT_COLORS = ["#7C3AED", "#06B6D4", "#8B5CF6", "#94A3B8", "#F59E0B", "#10B981"];
const TIME_TYPE_COLORS: Record<string, string> = {
  Development: "#7C3AED", Testing: "#06B6D4", Meetings: "#F59E0B", Documentation: "#94A3B8", Other: "#10B981",
};

function thisMonday(): string {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7));
  return monday.toISOString().slice(0, 10);
}

function MetricIcon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {d === "check" && <><circle cx="9" cy="9" r="7"/><path d="M6 9l2 2 4-4"/></>}
      {d === "pct"   && <><path d="M14 4L4 14"/><circle cx="5.5" cy="5.5" r="1.5"/><circle cx="12.5" cy="12.5" r="1.5"/></>}
      {d === "warn"  && <><path d="M9 2l7 14H2z"/><path d="M9 7v4M9 13v.5"/></>}
      {d === "flag"  && <><path d="M4 14V3"/><path d="M4 3h9l-2 4h2l-3 4H4"/></>}
    </svg>
  );
}

export default function ManagerDashboardPage() {
  const navigate = useNavigate();
  const [week, setWeek] = useState(thisMonday());
  const [activeTab, setActiveTab] = useState<"table" | "blockers" | "achievements">("table");

  const { data: summary } = useDashboardSummary(week);
  const { data: teamStatus = [] } = useTeamStatus(week);
  const { data: trend = [] } = useTasksTrend(8);
  const { data: workload = [] } = useWorkloadByProject(week);
  const { data: timeByType = [] } = useTimeByType(week);
  const { data: activities = [] } = useActivityFeed(10);
  const { data: teamReportsData } = useTeamReports({ weekStart: week, weekEnd: week, limit: 100 });
  const { data: blockersView = [] } = useSectionView(week, "blockers");
  const { data: achievementsView = [] } = useSectionView(week, "achievements");

  const teamReports = teamReportsData?.data ?? [];
  const notStarted = teamStatus.filter(m => m.status === "not_started");

  const memberStats = teamStatus.map(m => ({
    name: m.name,
    approved: m.status === "approved" ? 1 : 0,
    submitted: m.status === "submitted" ? 1 : 0,
    correction: m.status === "needs_correction" ? 1 : 0,
    draft: m.status === "draft" ? 1 : 0,
  }));

  // t.week comes back as a full ISO datetime (a raw GROUP BY on a DATE
  // column) rather than a plain date — truncated for display; a possible
  // off-by-one-day timezone shift is a pre-existing backend nuance, not
  // something to silently paper over with a guessed offset here.
  const trendChartData = trend.map(t => ({ w: t.week.slice(0, 10), v: t.count }));
  const workloadChartData = workload.map((w, i) => ({ label: w.projectName, v: w.totalHours, color: PROJECT_COLORS[i % PROJECT_COLORS.length] }));
  const timeTypeChartData = timeByType.map(t => ({ type: t.taskType, hours: t.totalHours, color: TIME_TYPE_COLORS[t.taskType] ?? "#94A3B8" }));

  const tabBtnStyle = (t: string): React.CSSProperties => ({
    padding: "10px 18px", background: activeTab === t ? "var(--accent-bg)" : "none",
    border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
    fontSize: 13, fontWeight: activeTab === t ? 700 : 500,
    color: activeTab === t ? "var(--accent)" : "var(--text-2)", transition: "all .12s",
  });

  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <PageHeader title="Manager Dashboard" sub={`Week of ${week} · ${teamStatus.length} team members`} action={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>Week starting</span>
          <input className="inp" type="date" value={week} onChange={e => setWeek(e.target.value)} style={{ width: 160 }} />
        </div>
      } />
      <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
          <MetricCard label="Submitted this week" value={summary?.totalSubmitted ?? 0} sub={`of ${teamStatus.length} members`} tint={TINTS.violet} icon={<MetricIcon d="check" />} />
          <MetricCard label="Compliance rate" value={`${summary?.complianceRate ?? 0}%`} sub="submitted this week" tint={TINTS.green} icon={<MetricIcon d="pct" />} />
          <MetricCard label="Needs correction" value={summary?.needsCorrectionCount ?? 0} sub="awaiting revision" tint={TINTS.amber} icon={<MetricIcon d="warn" />} />
          <MetricCard label="Open blockers" value={summary?.openBlockersCount ?? 0} sub="across all reports" tint={TINTS.red} icon={<MetricIcon d="flag" />} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden", background: "var(--surface)" }}>
            <div style={{ padding: "14px 18px", background: "#F8FAFC", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", letterSpacing: ".02em" }}>TASKS COMPLETED — 8-WEEK TREND</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)" }}>last 8 weeks</span>
            </div>
            <div style={{ padding: "18px 18px 14px" }}><TrendLineChart data={trendChartData} /></div>
          </div>
          <div style={{ borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden", background: "var(--surface)" }}>
            <div style={{ padding: "14px 18px", background: "#F8FAFC", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", letterSpacing: ".02em" }}>REPORT STATUS BY MEMBER</span>
              <div style={{ display: "flex", gap: 12 }}>
                {[["Approved","#10B981"],["Submitted","#3B82F6"],["Correction","#F59E0B"],["Draft","#CBD5E1"]].map(([l,c]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 7, height: 7, background: c, borderRadius: 2 }} />
                    <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--text-3)" }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: "18px 18px 14px" }}><StatusStackedBarChart data={memberStats} /></div>
          </div>
          <div style={{ borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden", background: "var(--surface)" }}>
            <div style={{ padding: "14px 18px", background: "#F8FAFC", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", letterSpacing: ".02em" }}>WORKLOAD BY PROJECT</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)" }}>hours</span>
            </div>
            <div style={{ padding: "18px 18px 14px" }}><WorkloadBarChart data={workloadChartData} /></div>
          </div>
          <div style={{ borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden", background: "var(--surface)" }}>
            <div style={{ padding: "14px 18px", background: "#F8FAFC", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", letterSpacing: ".02em" }}>TIME BY TASK TYPE</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)" }}>team-wide</span>
            </div>
            <div style={{ padding: "18px 18px 14px" }}><TimeTypeBarChart data={timeTypeChartData} /></div>
          </div>
        </div>

        <ActivityFeed activities={activities} />

        <Panel>
          <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--border)", gap: 8 }}>
            {(["table","blockers","achievements"] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={tabBtnStyle(t)}>
                {t === "table" ? "All reports" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === "table" && (
            <table className="dt">
              <thead><tr><th>Member</th><th>Project</th><th>Status</th><th>Last updated</th><th></th></tr></thead>
              <tbody>
                {teamReports.map(r => (
                  <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => navigate(`/review/${r.id}`)}>
                    <td><div style={{ display: "flex", alignItems: "center", gap: 9 }}>{r.user && <Avatar userId={String(r.user.id)} initials={r.user.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)} size={28} />}<span style={{ fontWeight: 700 }}>{r.user?.name}</span></div></td>
                    <td style={{ color: "var(--text-2)" }}>{r.project?.name}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td><Sm muted>{r.updatedAt.slice(0,16).replace("T"," ")}</Sm></td>
                    <td><span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700 }}>Review →</span></td>
                  </tr>
                ))}
                {notStarted.map(m => (
                  <tr key={m.userId + "-ns"} style={{ opacity: .7 }}>
                    <td><div style={{ display: "flex", alignItems: "center", gap: 9 }}><Avatar userId={String(m.userId)} initials={m.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)} size={28} /><span style={{ fontWeight: 700 }}>{m.name}</span></div></td>
                    <td><span style={{ color: "var(--text-3)", fontSize: 12 }}>—</span></td>
                    <td><span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: "#F8FAFC", color: "#64748B", fontSize: 11, fontWeight: 700 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#CBD5E1", flexShrink: 0 }} />Not submitted</span></td>
                    <td><span style={{ color: "var(--text-3)", fontSize: 12 }}>—</span></td>
                    <td></td>
                  </tr>
                ))}
                {teamReports.length === 0 && notStarted.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "var(--text-3)" }}>No reports for this week.</td></tr>
                )}
              </tbody>
            </table>
          )}
          {activeTab === "blockers" && (
            <table className="dt">
              <thead><tr><th>Member</th><th>Blocker</th><th>Key</th></tr></thead>
              <tbody>
                {blockersView.flatMap(m => m.entries.map((e, i) => ({ m, e, i }))).map(({ m, e, i }) => (
                  <tr key={`${m.userId}-${i}`}>
                    <td style={{ fontWeight: 700 }}>{m.name}</td>
                    <td style={{ color: "var(--text-2)" }}>{e.description}</td>
                    <td>{e.isKeyIssue && <span style={{ fontSize: 10, fontWeight: 800, color: "#92400E", background: "#FEF3C7", padding: "2px 8px", borderRadius: 12 }}>KEY</span>}</td>
                  </tr>
                ))}
                {blockersView.every(m => m.entries.length === 0) && <tr><td colSpan={3} style={{ textAlign: "center", padding: "30px", color: "var(--text-3)" }}>No blockers.</td></tr>}
              </tbody>
            </table>
          )}
          {activeTab === "achievements" && (
            <table className="dt">
              <thead><tr><th>Member</th><th>Achievement</th><th>Key</th></tr></thead>
              <tbody>
                {achievementsView.flatMap(m => m.entries.map((e, i) => ({ m, e, i }))).map(({ m, e, i }) => (
                  <tr key={`${m.userId}-${i}`}>
                    <td style={{ fontWeight: 700 }}>{m.name}</td>
                    <td style={{ color: "var(--text-2)" }}>{e.description}</td>
                    <td>{e.isKeyAchievement && <span style={{ fontSize: 10, fontWeight: 800, color: "#065F46", background: "#D1FAE5", padding: "2px 8px", borderRadius: 12 }}>KEY</span>}</td>
                  </tr>
                ))}
                {achievementsView.every(m => m.entries.length === 0) && <tr><td colSpan={3} style={{ textAlign: "center", padding: "30px", color: "var(--text-3)" }}>No achievements.</td></tr>}
              </tbody>
            </table>
          )}
        </Panel>
      </div>
    </div>
  );
}
