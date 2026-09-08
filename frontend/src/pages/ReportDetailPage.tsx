import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useProjects } from "@/hooks/useProjects";
import { useReport, useReportVersions, useReportVersion } from "@/hooks/useReports";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel, PH } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Btn } from "@/components/ui/Btn";
import { Sm } from "@/components/ui/Sm";
import { ReportBody } from "@/components/reports/ReportBody";
import { getCurrentVersion, getMostRecentReview, versionToContent } from "@/components/reports/reportMapping";

export default function ReportDetailPage() {
  const { reportId } = useParams();
  const id = reportId ? Number(reportId) : undefined;
  const { isManager } = useApp();
  const { data: projects = [] } = useProjects();
  const navigate = useNavigate();
  const { data: report, isLoading, error } = useReport(id);
  const { data: versions = [] } = useReportVersions(id);
  const [selVersionId, setSelVersionId] = useState<number | null>(null);
  const { data: selectedVersion } = useReportVersion(id, selVersionId);
  const [vOpen, setVOpen] = useState(false);

  if (isLoading) return null;
  if (error || !report) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--text-3)" }}>
        This report doesn't exist, or you don't have permission to view it.
      </div>
    );
  }

  const currentVersion = getCurrentVersion(report);
  const displayVersion = selectedVersion ?? currentVersion;
  const content = displayVersion ? versionToContent(report, displayVersion) : null;
  const selectedLatestReview = selectedVersion?.reviews.at(-1);
  const latestReview = selectedVersion
    ? (selectedLatestReview
        ? {
            status: (selectedLatestReview.action === "approved" ? "approved" : "needs_correction") as "approved" | "needs_correction",
            comment: selectedLatestReview.comment,
            date: selectedLatestReview.createdAt.slice(0, 16).replace("T", " "),
            author: selectedLatestReview.reviewer?.name ?? "Manager",
          }
        : null)
    : getMostRecentReview(report);

  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <PageHeader title={`Report — ${report.weekStartDate}`} sub={`${report.user?.name ?? "?"} · ${report.project?.name ?? "?"}`}
        action={<div style={{ display: "flex", gap: 8 }}><StatusBadge status={report.status} /><Btn variant="ghost" size="sm" onClick={() => navigate(-1)}>← Back</Btn></div>} />
      <div className="page-pad" style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
        {content && <ReportBody content={content} projects={projects.map(p => ({ id: p.id, name: p.name }))} readOnly latestReview={latestReview} />}

        <Panel>
          <div onClick={() => setVOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 18px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>
            <span style={{ fontSize: 11 }}>{vOpen ? "▾" : "▸"}</span>
            Version history ({versions.length} version{versions.length !== 1 ? "s" : ""})
          </div>
          {vOpen && (
            <div>
              <div className="table-wrap">
              <table className="dt">
                <thead><tr><th>Submitted</th><th>Review comment</th><th></th></tr></thead>
                <tbody>
                  {versions.map(v => (
                    <tr key={v.id}>
                      <td data-label="Submitted"><Sm muted>{v.submittedAt?.slice(0,16).replace("T"," ") ?? "—"}</Sm></td>
                      <td data-label="Review comment" style={{ color: "var(--text-2)" }}>{v.reviews.at(-1)?.comment ?? <span style={{ color: "var(--text-3)" }}>No review yet</span>}</td>
                      <td data-label=""><button onClick={() => setSelVersionId(selVersionId === v.id ? null : v.id)} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", padding: 0 }}>{selVersionId === v.id ? "← Current" : "View"}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              {selVersionId !== null && (
                <div style={{ padding: "10px 18px", borderTop: "1px solid var(--border)", fontSize: 12, color: "var(--text-3)" }}>
                  Viewing version {versions.find(v => v.id === selVersionId)?.versionNumber} of {versions.length}.{" "}
                  <button onClick={() => setSelVersionId(null)} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", padding: 0 }}>Return to latest</button>
                </div>
              )}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
