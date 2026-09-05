import { useNavigate, useParams } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUsers";
import { getAvatarColor } from "@/utils/avatar";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel, PH } from "@/components/ui/Panel";
import { Btn } from "@/components/ui/Btn";
import { MetricCard, TINTS } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function MemberProfilePage() {
  const { memberId } = useParams();
  const id = memberId ? Number(memberId) : undefined;
  const navigate = useNavigate();
  const { data: profile, isLoading } = useUserProfile(id);

  if (isLoading) return null;
  if (!profile) {
    return <div style={{ padding: 40, textAlign: "center", color: "var(--text-3)" }}>Member not found.</div>;
  }

  const { user, stats, recentReports } = profile;
  const initials = user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const { bg } = getAvatarColor(String(user.id));

  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <PageHeader title={user.name} sub={user.email} action={<Btn variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>← Back</Btn>} />
      <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow)" }}>
          <div style={{ background: `linear-gradient(135deg,${bg} 0%,${bg}CC 100%)`, padding: "28px 28px 24px", display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(255,255,255,.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#fff" }}>{initials}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-.01em" }}>{user.name}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.8)", marginTop: 3, fontWeight: 500 }}>{user.email} · {user.role}</div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          <MetricCard label="Total reports submitted" value={stats.totalReportsSubmitted} tint={TINTS.violet} icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="2" width="12" height="14" rx="2"/><path d="M6 6h6M6 9h6M6 12h4"/></svg>} />
          <MetricCard label="Approval rate" value={`${stats.currentApprovalRate}%`} tint={TINTS.green} icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="9" cy="9" r="7"/><path d="M6 9l2 2 4-4"/></svg>} />
          <MetricCard label="Open blockers" value={stats.openBlockersCount} tint={TINTS.red} icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 16V3M4 3h9l-2 4h2l-3 4H4"/></svg>} />
        </div>

        <Panel>
          <PH>Recent reports</PH>
          <table className="dt">
            <thead><tr><th>Week</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {recentReports.map(r => (
                <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => navigate(`/reports/${r.id}`)}>
                  <td><span style={{ fontWeight: 700 }}>{r.week}</span></td>
                  <td><StatusBadge status={r.status as any} /></td>
                  <td><span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700 }}>View →</span></td>
                </tr>
              ))}
              {recentReports.length === 0 && <tr><td colSpan={3} style={{ textAlign: "center", padding: "30px", color: "var(--text-3)" }}>No reports yet.</td></tr>}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
}
