import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMyReports } from "@/hooks/useReports";
import type { ReportStatus } from "@/api/reports.api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Sm } from "@/components/ui/Sm";
import { Btn } from "@/components/ui/Btn";

export default function ReportHistoryPage() {
  const navigate = useNavigate();
  const [sf, setSf] = useState<ReportStatus | "all">("all");
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data, isLoading } = useMyReports({ status: sf === "all" ? undefined : sf, page, limit });
  const rows = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <PageHeader title="Report History" sub="Your submitted and saved reports" />
      <div className="page-pad" style={{ padding: "16px 28px 0", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>Filter by status</span>
        <select className="sel" value={sf} onChange={e => { setSf(e.target.value as ReportStatus | "all"); setPage(1); }}>
          <option value="all">All statuses</option><option value="draft">Draft</option><option value="submitted">Submitted</option><option value="needs_correction">Needs correction</option><option value="approved">Approved</option>
        </select>
        <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "var(--text-3)", background: "var(--raised)", padding: "4px 10px", borderRadius: 8 }}>{total} report{total !== 1 ? "s" : ""}</span>
      </div>
      <div className="page-pad" style={{ padding: "12px 28px" }}>
        <Panel>
          <div className="table-wrap">
          <table className="dt">
            <thead><tr><th>Week</th><th>Project</th><th>Status</th><th>Last updated</th><th></th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => navigate(`/reports/${r.id}`)}>
                  <td data-label="Week"><span style={{ fontWeight: 700 }}>{r.weekStartDate}</span></td>
                  <td data-label="Project" style={{ color: "var(--text-2)" }}>{r.project?.name ?? "—"}</td>
                  <td data-label="Status"><StatusBadge status={r.status} /></td>
                  <td data-label="Last updated"><Sm muted>{r.updatedAt.slice(0, 16).replace("T", " ")}</Sm></td>
                  <td data-label=""><span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700 }}>View →</span></td>
                </tr>
              ))}
              {!isLoading && rows.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "var(--text-3)" }}>No reports found.</td></tr>}
            </tbody>
          </table>
          </div>
        </Panel>
        {total > limit && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 14 }}>
            <Btn variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Btn>
            <span style={{ fontSize: 12, color: "var(--text-3)", alignSelf: "center" }}>Page {page} of {Math.ceil(total / limit)}</span>
            <Btn variant="ghost" size="sm" onClick={() => setPage(p => (p * limit < total ? p + 1 : p))}>Next</Btn>
          </div>
        )}
      </div>
    </div>
  );
}
