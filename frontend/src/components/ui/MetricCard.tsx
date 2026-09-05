export const TINTS = {
  violet: { bg: "linear-gradient(135deg,#F3EFFE 0%,#EEF2FF 100%)", fg: "#5B21B6", iconBg: "#7C3AED" },
  green:  { bg: "linear-gradient(135deg,#D1FAE5 0%,#ECFDF5 100%)", fg: "#065F46", iconBg: "#059669" },
  amber:  { bg: "linear-gradient(135deg,#FEF3C7 0%,#FFFBEB 100%)", fg: "#92400E", iconBg: "#D97706" },
  red:    { bg: "linear-gradient(135deg,#FEE2E2 0%,#FFF5F5 100%)", fg: "#991B1B", iconBg: "#EF4444" },
  cyan:   { bg: "linear-gradient(135deg,#CFFAFE 0%,#ECFEFF 100%)", fg: "#155E75", iconBg: "#0891B2" },
};

export function MetricCard({ label, value, sub, tint, icon }: {
  label: string; value: string | number; sub?: string;
  tint: { bg: string; fg: string; iconBg: string }; icon: React.ReactNode;
}) {
  return (
    <div style={{ background: tint.bg, borderRadius: 14, padding: "18px 20px", border: "1px solid rgba(255,255,255,.6)", boxShadow: "0 2px 6px rgba(15,23,42,.05)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -10, right: -10, width: 54, height: 54, borderRadius: "50%", background: "rgba(255,255,255,.22)" }} />
      <div style={{ position: "absolute", top: 10, right: 10, width: 30, height: 30, borderRadius: 8, background: tint.iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        {icon}
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, color: tint.fg, opacity: .7, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: tint.fg, lineHeight: 1, letterSpacing: "-.02em" }}>{value}</div>
      {sub && <div style={{ fontSize: 10, fontWeight: 500, color: tint.fg, opacity: .6, marginTop: 5 }}>{sub}</div>}
    </div>
  );
}
