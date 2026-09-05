export function MobileTopBar({ onMenu }: { onMenu: () => void }) {
  return (
    <div className="mobile-topbar" style={{
      alignItems: "center", justifyContent: "space-between",
      padding: "0 16px", height: 56, flexShrink: 0,
      background: "linear-gradient(135deg,#7C3AED 0%,#5B21B6 100%)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="15" height="15" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".9"/><rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".6"/><rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" opacity=".6"/><rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" opacity=".9"/></svg>
        </div>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "-.02em" }}>Sitrep</span>
      </div>
      <button onClick={onMenu} aria-label="Open menu" style={{
        width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(255,255,255,.15)", border: "none", borderRadius: 10, cursor: "pointer",
      }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M3 5h14M3 10h14M3 15h14"/></svg>
      </button>
    </div>
  );
}
