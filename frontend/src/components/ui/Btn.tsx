export function Btn({ children, variant = "primary", size = "md", onClick, type = "button", disabled }: {
  children: React.ReactNode; variant?: "primary"|"ghost"|"approve"|"warn"|"danger";
  size?: "sm"|"md"; onClick?: () => void; type?: "button"|"submit"; disabled?: boolean;
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: "var(--gradient)", color: "#fff", border: "none", boxShadow: "var(--shadow-accent)" },
    ghost:   { background: "#fff", color: "var(--text-2)", border: "1.5px solid var(--border)", boxShadow: "var(--shadow-xs)" },
    approve: { background: "#D1FAE5", color: "#065F46", border: "none" },
    warn:    { background: "#FEF3C7", color: "#92400E", border: "none" },
    danger:  { background: "#FEE2E2", color: "#B91C1C", border: "none" },
  };
  const pad = size === "sm" ? "6px 14px" : "9px 18px";
  const fz  = size === "sm" ? 12 : 13;
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: pad, borderRadius: 10, fontFamily: "inherit", fontWeight: 700, fontSize: fz, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .45 : 1, transition: "opacity .1s, transform .1s", ...styles[variant] }}>
      {children}
    </button>
  );
}
