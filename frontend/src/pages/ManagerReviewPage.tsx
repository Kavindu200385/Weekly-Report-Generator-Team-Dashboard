import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useProjects } from "@/hooks/useProjects";
import { useReport } from "@/hooks/useReports";
import { useCreateReview, useReportReviews } from "@/hooks/useReviews";
import { PageHeader } from "@/components/ui/PageHeader";
import { Btn } from "@/components/ui/Btn";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ReportBody } from "@/components/reports/ReportBody";
import { getCurrentVersion, versionToContent } from "@/components/reports/reportMapping";

export default function ManagerReviewPage() {
  const { reportId } = useParams();
  const id = reportId ? Number(reportId) : undefined;
  const { isManager } = useApp();
  const { data: projects = [] } = useProjects();
  const navigate = useNavigate();
  const { data: report } = useReport(id);
  const { data: reviews = [] } = useReportReviews(id);
  const createReview = useCreateReview();
  const [commentMode, setCommentMode] = useState(false);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const back = () => navigate("/review-queue");

  if (!isManager || !report || !id) return null;

  const version = getCurrentVersion(report);
  const content = version ? versionToContent(report, version) : null;

  const approve = async () => {
    setError(null);
    try {
      await createReview.mutateAsync({ reportId: id, action: "approved", comment: comment || undefined });
      back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve.");
    }
  };
  const requestChanges = async () => {
    if (!comment.trim()) return;
    setError(null);
    try {
      await createReview.mutateAsync({ reportId: id, action: "changes_requested", comment });
      setCommentMode(false); setComment("");
      back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request changes.");
    }
  };

  return (
    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <PageHeader title={`Review — ${report.user?.name ?? "?"}`} sub={`${report.weekStartDate} · ${report.project?.name ?? "?"}`} action={<Btn variant="ghost" size="sm" onClick={back}>← Back</Btn>} />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {content && <ReportBody content={content} projects={projects.map(p => ({ id: p.id, name: p.name }))} readOnly />}
        </div>
        <div style={{ width: 292, flexShrink: 0, background: "#fff", borderLeft: "1px solid var(--border)", padding: "22px 20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 22 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Current Status</div>
            <StatusBadge status={report.status} />
          </div>
          {error && <div style={{ padding: "10px 12px", background: "#FEE2E2", color: "#B91C1C", borderRadius: 10, fontSize: 12 }}>{error}</div>}
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Review Actions</div>
            {report.status !== "submitted"
              ? <div style={{ borderRadius: 10, padding: "12px 16px", textAlign: "center", color: "var(--text-3)", background: "var(--raised)", fontWeight: 600, fontSize: 13 }}>Only submitted reports can be reviewed. Current status: {report.status}.</div>
              : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Btn variant="approve" onClick={approve}>✓ Approve report</Btn>
                  <Btn variant="warn" onClick={() => setCommentMode(o => !o)}>↩ Request changes</Btn>
                </div>}
          </div>
          {commentMode && report.status === "submitted" && (
            <div>
              <FieldLabel>Reviewer comment (required)</FieldLabel>
              <textarea className="ta" value={comment} onChange={e => setComment(e.target.value)} placeholder="Explain what needs to change…" style={{ minHeight: 110 }} />
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <Btn variant="warn" size="sm" onClick={requestChanges} disabled={!comment.trim()}>Send</Btn>
                <Btn variant="ghost" size="sm" onClick={() => setCommentMode(false)}>Cancel</Btn>
              </div>
            </div>
          )}
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Review History</div>
            {reviews.length === 0
              ? <div style={{ fontSize: 13, color: "var(--text-3)", padding: "16px", background: "var(--raised)", borderRadius: 10, textAlign: "center" }}>No reviews yet</div>
              : reviews.map((rv, i) => (
                <div key={i} style={{ background: "var(--raised)", borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 5, fontWeight: 600 }}>{rv.createdAt.slice(0,16).replace("T"," ")} · {rv.reviewer.name} · v{rv.versionNumber}</div>
                  <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.55 }}>{rv.comment}</div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
