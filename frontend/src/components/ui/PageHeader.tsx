export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div style={{ padding: "22px 32px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: "var(--surface)", boxShadow: "0 1px 0 var(--border)" }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-.02em" }}>{title}</h1>
        {sub && <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2, fontWeight: 500 }}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}
