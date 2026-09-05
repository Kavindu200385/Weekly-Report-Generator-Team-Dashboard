import { useState } from "react";

export function Collapsible({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="coll" onClick={() => setOpen(o => !o)}>
        <span style={{ fontSize: 11 }}>{open ? "▾" : "▸"}</span>
        {label}
      </div>
      {open && <div style={{ paddingTop: 10, paddingBottom: 4 }}>{children}</div>}
    </div>
  );
}
