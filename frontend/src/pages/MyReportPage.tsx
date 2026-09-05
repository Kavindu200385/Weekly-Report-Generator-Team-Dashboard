import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useProjects } from "@/hooks/useProjects";
import { useMyReports, useReport, useCreateReport, useUpdateReport, useSubmitReport } from "@/hooks/useReports";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Btn } from "@/components/ui/Btn";
import { ReportBody, type ReportContent } from "@/components/reports/ReportBody";
import { blankContent, contentToUpdateInput, getCurrentVersion, getMostRecentReview, versionToContent } from "@/components/reports/reportMapping";

function thisMonday(): string {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7));
  return monday.toISOString().slice(0, 10);
}

export default function MyReportPage() {
  const { me } = useApp();
  const { data: projects = [] } = useProjects();
  const week = thisMonday();

  const { data: myReports } = useMyReports({ limit: 100 });
  const existing = myReports?.data.find(r => r.weekStartDate === week);

  const { data: reportDetail } = useReport(existing?.id);
  const createReport = useCreateReport();
  const updateReport = useUpdateReport();
  const submitReport = useSubmitReport();

  const [draft, setDraft] = useState<ReportContent>(blankContent(projects[0]?.id ?? ""));
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reportDetail) {
      const version = getCurrentVersion(reportDetail);
      if (version) setDraft(versionToContent(reportDetail, version));
    } else if (!existing && projects.length) {
      setDraft(d => (d.projectId === "" ? { ...d, projectId: projects[0].id } : d));
    }
  }, [reportDetail, existing, projects]);

  const status = reportDetail?.status ?? "draft";
  const editable = status === "draft" || status === "needs_correction";
  const latestReview = reportDetail ? getMostRecentReview(reportDetail) : null;
  const patch = (p: Partial<ReportContent>) => setDraft(d => ({ ...d, ...p }));

  const ensureReportId = async (): Promise<number> => {
    if (existing) return existing.id;
    const created = await createReport.mutateAsync({
      projectId: draft.projectId as number,
      weekStartDate: draft.weekStartDate,
      weekEndDate: draft.weekEndDate,
    });
    return created.id;
  };

  const saveDraft = async () => {
    setError(null);
    try {
      const id = await ensureReportId();
      await updateReport.mutateAsync({ id, ...contentToUpdateInput(draft) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    }
  };

  const submit = async () => {
    setError(null);
    try {
      const id = await ensureReportId();
      await updateReport.mutateAsync({ id, ...contentToUpdateInput(draft) });
      await submitReport.mutateAsync(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit.");
    }
  };

  if (!me) return null;

  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <PageHeader title="My Weekly Report" sub={`Week of ${draft.weekStartDate}`} action={
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <StatusBadge status={status} />
          {editable && <><Btn variant="ghost" size="sm" onClick={saveDraft}>Save draft</Btn><Btn variant="primary" size="sm" onClick={submit}>Submit report</Btn></>}
          {saved && <span style={{ fontSize: 12, color: "var(--s-appr)", fontWeight: 700 }}>✓ Saved</span>}
        </div>
      } />
      {error && <div className="page-pad" style={{ margin: "12px 28px 0", padding: "10px 14px", background: "#FEE2E2", color: "#B91C1C", borderRadius: 10, fontSize: 13 }}>{error}</div>}
      <div className="page-pad" style={{ padding: "24px 28px" }}>
        <ReportBody content={draft} projects={projects.map(p => ({ id: p.id, name: p.name }))} readOnly={!editable} onChange={patch} latestReview={latestReview} />
      </div>
    </div>
  );
}
