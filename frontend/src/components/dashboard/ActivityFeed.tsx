import type { ActivityFeedEntry } from "@/api/dashboard.api";
import { Panel, PH } from "@/components/ui/Panel";

export function ActivityFeed({ activities }: { activities: ActivityFeedEntry[] }) {
  return (
    <Panel style={{ fontSize: 13 }}>
      <PH>Recent activity</PH>
      <div>
        {activities.length === 0 && (
          <div style={{ padding: "28px", textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>No activity yet.</div>
        )}
        {activities.map((a, i) => {
          const isSubmit = a.type === "submission";
          const isApprove = a.action === "approved";
          const dot = isApprove ? "#10B981" : isSubmit ? "#3B82F6" : "#F59E0B";
          const icon = isApprove ? "✓" : isSubmit ? "↑" : "↩";
          const iconBg = isApprove ? "#D1FAE5" : isSubmit ? "#EFF6FF" : "#FEF3C7";
          const iconFg = isApprove ? "#065F46" : isSubmit ? "#1D4ED8" : "#92400E";
          const desc = isSubmit ? "submitted a report" : isApprove ? "was approved" : "was sent back for correction";
          return (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 20px", borderBottom: i < activities.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: iconFg, fontWeight: 800, flexShrink: 0 }}>{icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: "var(--text-1)", fontWeight: 500 }}>
                  <span style={{ fontWeight: 700 }}>{a.userName}</span>
                  {" "}<span style={{ color: "var(--text-2)" }}>{desc}</span>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-3)", whiteSpace: "nowrap", fontWeight: 500, flexShrink: 0 }}>{a.timestamp.slice(0, 16).replace("T", " ")}</div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
