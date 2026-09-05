import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTeamReports } from "@/hooks/useReviews";
import { Avatar } from "@/components/ui/Avatar";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Btn } from "@/components/ui/Btn";
import { Sm } from "@/components/ui/Sm";

export default function ReviewQueuePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"submitted" | "needs_correction">("submitted");
  const { data: submittedData } = useTeamReports({ status: "submitted", limit: 100 });
  const { data: correctionData } = useTeamReports({ status: "needs_correction", limit: 100 });
  const submittedCount = submittedData?.total ?? 0;
  const correctionCount = correctionData?.total ?? 0;
  const queue = (tab === "submitted" ? submittedData : correctionData)?.data ?? [];

  const tabStyle = (t: string): React.CSSProperties => ({
    padding: "10px 18px", borderRadius: 10, border: "none", cursor: "pointer",
    fontFamily: "inherit", fontSize: 13, fontWeight: tab === t ? 700 : 500,
    background: tab === t ? "var(--accent-bg)" : "transparent",
    color: tab === t ? "var(--accent)" : "var(--text-2)", transition: "all .12s",
  });

  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <PageHeader title="Review Queue" sub="Reports awaiting your review action" />
      <div className="page-pad" style={{ padding: "18px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 20px", borderRadius: 14, background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#1D4ED8" }}>{submittedCount}</span>
            <div><div style={{ fontSize: 12, fontWeight: 700, color: "#1D4ED8" }}>Awaiting review</div><div style={{ fontSize: 11, color: "#3B82F6" }}>submitted reports</div></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 20px", borderRadius: 14, background: "#FEF3C7", border: "1px solid #FDE68A" }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#92400E" }}>{correctionCount}</span>
            <div><div style={{ fontSize: 12, fontWeight: 700, color: "#92400E" }}>Needs correction</div><div style={{ fontSize: 11, color: "#B45309" }}>awaiting re-submission</div></div>
          </div>
        </div>

        <Panel>
          <div style={{ display: "flex", gap: 4, padding: "6px 8px", borderBottom: "1px solid var(--border)" }}>
            <button style={tabStyle("submitted")} onClick={() => setTab("submitted")}>
              Awaiting review {submittedCount > 0 && <span style={{ marginLeft: 6, background: "#3B82F6", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 800 }}>{submittedCount}</span>}
            </button>
            <button style={tabStyle("needs_correction")} onClick={() => setTab("needs_correction")}>
              Sent back {correctionCount > 0 && <span style={{ marginLeft: 6, background: "#F59E0B", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 800 }}>{correctionCount}</span>}
            </button>
          </div>
          <div className="table-wrap">
          <table className="dt">
            <thead>
              <tr><th>Member</th><th>Week</th><th>Project</th><th>Last updated</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {queue.map(r => (
                <tr key={r.id}>
                  <td data-label="Member">
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      {r.user && <Avatar userId={String(r.user.id)} initials={r.user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2)} size={30} />}
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{r.user?.name}</div>
                    </div>
                  </td>
                  <td data-label="Week"><span style={{ fontWeight: 700 }}>{r.weekStartDate}</span></td>
                  <td data-label="Project" style={{ color: "var(--text-2)" }}>{r.project?.name ?? "—"}</td>
                  <td data-label="Last updated"><Sm muted>{r.updatedAt.slice(0,16).replace("T"," ")}</Sm></td>
                  <td data-label="Actions">
                    <div style={{ display: "flex", gap: 8 }}>
                      <Btn variant="primary" size="sm" onClick={() => navigate(`/review/${r.id}`)}>Review</Btn>
                      <Btn variant="ghost" size="sm" onClick={() => navigate(`/reports/${r.id}`)}>View</Btn>
                    </div>
                  </td>
                </tr>
              ))}
              {queue.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "48px", color: "var(--text-3)" }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>✓</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-2)" }}>Queue clear</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>No reports awaiting {tab === "submitted" ? "review" : "re-submission"}.</div>
                </td></tr>
              )}
            </tbody>
          </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
