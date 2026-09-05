import { uid } from "@/utils/id";
import { Sm } from "@/components/ui/Sm";
import { Btn } from "@/components/ui/Btn";

export interface ApiTaskRow {
  id: string;
  taskName: string;
  priority: string;
  plannedPct: number;
  actualPct: number;
  status: string;
  timePlannedHrs: number;
  timeSpentHrs: number;
  outputDeliverable?: string;
}

const PRIORITIES = ["low", "medium", "high", "critical"];
const STATUSES = ["not-started", "in-progress", "done", "blocked"];
const PCOL: Record<string, string> = { low: "#10B981", medium: "#3B82F6", high: "#F59E0B", critical: "#EF4444" };

function newTaskRow(): ApiTaskRow {
  return { id: uid(), taskName: "", priority: "medium", plannedPct: 100, actualPct: 0, status: "not-started", timePlannedHrs: 0, timeSpentHrs: 0, outputDeliverable: "" };
}

export function TaskTable({ tasks, onChange, readOnly }: { tasks: ApiTaskRow[]; onChange?: (t: ApiTaskRow[]) => void; readOnly?: boolean }) {
  const up = (id: string, f: keyof ApiTaskRow, v: any) => onChange?.(tasks.map(t => t.id === id ? { ...t, [f]: v } : t));
  const rm = (id: string) => onChange?.(tasks.filter(t => t.id !== id));
  const add = () => onChange?.([...tasks, newTaskRow()]);

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table className="dt" style={{ minWidth: 860 }}>
          <thead>
            <tr>
              <th style={{ width: "22%" }}>Task name</th><th style={{ width: "9%" }}>Priority</th>
              <th style={{ width: "7%" }}>Plan %</th><th style={{ width: "7%" }}>Actual %</th>
              <th style={{ width: "12%" }}>Status</th><th style={{ width: "7%" }}>Plan (h)</th>
              <th style={{ width: "7%" }}>Spent (h)</th><th>Output</th>
              {!readOnly && <th style={{ width: 28 }} />}
            </tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id}>
                <td>{readOnly ? <span style={{ fontWeight: 600 }}>{t.taskName}</span> : <input className="ti" value={t.taskName} onChange={e => up(t.id, "taskName", e.target.value)} placeholder="Task…" />}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: PCOL[t.priority] ?? "#94A3B8", flexShrink: 0 }} />
                    {readOnly ? <Sm>{t.priority}</Sm> : <select className="ts" value={t.priority} onChange={e => up(t.id, "priority", e.target.value)}>{PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}</select>}
                  </div>
                </td>
                <td>{readOnly ? <Sm>{t.plannedPct}%</Sm> : <input className="ti" type="number" min={0} max={100} value={t.plannedPct} onChange={e => up(t.id, "plannedPct", +e.target.value)} />}</td>
                <td>{readOnly ? <Sm>{t.actualPct}%</Sm> : <input className="ti" type="number" min={0} max={100} value={t.actualPct} onChange={e => up(t.id, "actualPct", +e.target.value)} />}</td>
                <td>{readOnly ? <Sm>{t.status}</Sm> : <select className="ts" value={t.status} onChange={e => up(t.id, "status", e.target.value)}>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select>}</td>
                <td>{readOnly ? <Sm muted>{t.timePlannedHrs}h</Sm> : <input className="ti" type="number" min={0} step={0.5} value={t.timePlannedHrs} onChange={e => up(t.id, "timePlannedHrs", +e.target.value)} />}</td>
                <td>{readOnly ? <Sm muted>{t.timeSpentHrs}h</Sm> : <input className="ti" type="number" min={0} step={0.5} value={t.timeSpentHrs} onChange={e => up(t.id, "timeSpentHrs", +e.target.value)} />}</td>
                <td style={{ color: "var(--text-2)", fontSize: 13 }}>{readOnly ? (t.outputDeliverable || "—") : <input className="ti" value={t.outputDeliverable ?? ""} onChange={e => up(t.id, "outputDeliverable", e.target.value)} placeholder="PR #, link…" />}</td>
                {!readOnly && <td><button onClick={() => rm(t.id)} style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", fontSize: 18, padding: "0 2px", lineHeight: 1 }}>×</button></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!readOnly && <div style={{ padding: "10px 16px" }}><Btn variant="ghost" size="sm" onClick={add}>+ Add row</Btn></div>}
    </div>
  );
}
