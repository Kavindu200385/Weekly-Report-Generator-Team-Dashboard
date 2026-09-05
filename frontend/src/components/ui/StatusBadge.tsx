import type { Status } from "@/types";
import { SC } from "@/utils/status";

export function StatusBadge({ status }: { status: Status }) {
  const { label, bg, fg, dot } = SC[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: bg, color: fg, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0 }} />
      {label}
    </span>
  );
}
