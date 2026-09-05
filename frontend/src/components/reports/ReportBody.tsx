import { Panel, PH } from "@/components/ui/Panel";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { Collapsible } from "@/components/ui/Collapsible";
import { Btn } from "@/components/ui/Btn";
import { TaskTable, type ApiTaskRow } from "@/components/reports/TaskTable";
import { RepList, type RepListItem } from "@/components/reports/RepList";
import { uid } from "@/utils/id";

export interface HoursRow { id: string; taskType: string; hours: number }

export interface ReportContent {
  weekStartDate: string;
  weekEndDate: string;
  projectId: number | "";
  tasksPlannedNextWeek: string;
  notes: string;
  tasks: ApiTaskRow[];
  blockers: RepListItem[];
  achievements: RepListItem[];
  hoursByType: HoursRow[];
}

export interface ProjectOption { id: number; name: string }

export interface LatestReview {
  status: "needs_correction" | "approved";
  comment: string | null;
  date: string;
  author: string;
}

const TASK_TYPES = ["Development", "Testing", "Meetings", "Documentation", "Other"];

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function ReportBody({ content, projects, readOnly, onChange, latestReview }: {
  content: ReportContent; projects: ProjectOption[]; readOnly: boolean;
  onChange?: (patch: Partial<ReportContent>) => void;
  latestReview?: LatestReview | null;
}) {
  const proj = projects.find(p => p.id === content.projectId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {latestReview?.status === "needs_correction" && (
        <div style={{ borderRadius: 12, padding: "16px 20px", background: "#FFFBEB", border: "1px solid #FDE68A", display: "flex", gap: 14 }}>
          <div style={{ width: 4, borderRadius: 4, background: "#F59E0B", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#92400E", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>Needs correction</div>
            <div style={{ fontSize: 13, color: "#78350F", lineHeight: 1.65 }}>{latestReview.comment}</div>
            <div style={{ fontSize: 11, color: "#B45309", marginTop: 8, fontWeight: 500 }}>{latestReview.date} · {latestReview.author}</div>
          </div>
        </div>
      )}
      {latestReview?.status === "approved" && (
        <div style={{ borderRadius: 12, padding: "16px 20px", background: "#ECFDF5", border: "1px solid #A7F3D0", display: "flex", gap: 14 }}>
          <div style={{ width: 4, borderRadius: 4, background: "#10B981", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#065F46", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>Approved</div>
            <div style={{ fontSize: 13, color: "#064E3B", lineHeight: 1.65 }}>{latestReview.comment}</div>
            <div style={{ fontSize: 11, color: "#059669", marginTop: 8, fontWeight: 500 }}>{latestReview.date} · {latestReview.author}</div>
          </div>
        </div>
      )}

      <Panel>
        <PH>Report metadata</PH>
        <div style={{ padding: "16px 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <FieldLabel>Week starting</FieldLabel>
            {readOnly ? <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{content.weekStartDate} – {content.weekEndDate}</span>
              : <input className="inp" type="date" value={content.weekStartDate} onChange={e => onChange?.({ weekStartDate: e.target.value, weekEndDate: addDays(e.target.value, 4) })} />}
          </div>
          <div>
            <FieldLabel>Project</FieldLabel>
            {readOnly ? <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{proj?.name ?? "—"}</span>
              : <select className="sel" value={content.projectId} onChange={e => onChange?.({ projectId: Number(e.target.value) })} style={{ width: "100%", fontSize: 13, padding: "8px 12px" }}>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>}
          </div>
        </div>
      </Panel>

      <Panel><PH>Tasks completed this week</PH><TaskTable tasks={content.tasks} onChange={readOnly ? undefined : t => onChange?.({ tasks: t })} readOnly={readOnly} /></Panel>

      <Panel>
        <PH>Tasks planned for next week</PH>
        <div style={{ padding: "16px 18px" }}>
          {readOnly
            ? <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)", lineHeight: 1.7 }}>{content.tasksPlannedNextWeek || <span style={{ color: "var(--text-3)" }}>Not provided</span>}</p>
            : <textarea className="ta" value={content.tasksPlannedNextWeek} onChange={e => onChange?.({ tasksPlannedNextWeek: e.target.value })} placeholder="Describe planned work…" style={{ minHeight: 88 }} />}
        </div>
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Panel>
          <PH>Blockers</PH>
          <div style={{ padding: "12px 18px" }}>
            {content.blockers.length === 0 && readOnly
              ? <span style={{ color: "var(--text-3)", fontSize: 13 }}>None reported</span>
              : <RepList items={content.blockers} onChange={readOnly ? undefined : v => onChange?.({ blockers: v })} placeholder="Describe blocker…" keyLabel="Key issue" readOnly={readOnly} />}
          </div>
        </Panel>
        <Panel>
          <PH>Achievements</PH>
          <div style={{ padding: "12px 18px" }}>
            {content.achievements.length === 0 && readOnly
              ? <span style={{ color: "var(--text-3)", fontSize: 13 }}>None reported</span>
              : <RepList items={content.achievements} onChange={readOnly ? undefined : v => onChange?.({ achievements: v })} placeholder="Describe achievement…" keyLabel="Key achievement" readOnly={readOnly} />}
          </div>
        </Panel>
      </div>

      <Panel>
        <div style={{ padding: "0 18px" }}>
          <Collapsible label="Hours by task type (optional)">
            <div style={{ paddingBottom: 14 }}>
              {content.hoursByType.length === 0 && readOnly && <span style={{ color: "var(--text-3)", fontSize: 13 }}>None reported</span>}
              {content.hoursByType.map(h => (
                <div key={h.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                  {readOnly ? (
                    <span style={{ fontSize: 13, color: "var(--text-2)" }}>{h.taskType}: <b style={{ color: "var(--text-1)" }}>{h.hours}h</b></span>
                  ) : (
                    <>
                      <select className="sel" value={h.taskType} onChange={e => onChange?.({ hoursByType: content.hoursByType.map(x => x.id === h.id ? { ...x, taskType: e.target.value } : x) })}>
                        {TASK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <input className="inp" type="number" min={0} step={0.5} value={h.hours} style={{ width: 100 }}
                        onChange={e => onChange?.({ hoursByType: content.hoursByType.map(x => x.id === h.id ? { ...x, hours: +e.target.value } : x) })} />
                      <span style={{ fontSize: 12, color: "var(--text-3)" }}>hours</span>
                      <button onClick={() => onChange?.({ hoursByType: content.hoursByType.filter(x => x.id !== h.id) })} style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", fontSize: 18, padding: "0 2px", lineHeight: 1 }}>×</button>
                    </>
                  )}
                </div>
              ))}
              {!readOnly && (
                <Btn variant="ghost" size="sm" onClick={() => onChange?.({ hoursByType: [...content.hoursByType, { id: uid(), taskType: "Development", hours: 0 }] })}>
                  + Add
                </Btn>
              )}
            </div>
          </Collapsible>
          <Collapsible label="Notes and links (optional)">
            <div style={{ paddingBottom: 14 }}>
              {readOnly
                ? <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)", lineHeight: 1.7 }}>{content.notes || <span style={{ color: "var(--text-3)" }}>None</span>}</p>
                : <textarea className="ta" value={content.notes} onChange={e => onChange?.({ notes: e.target.value })} placeholder="Links, context…" />}
            </div>
          </Collapsible>
        </div>
      </Panel>
    </div>
  );
}
