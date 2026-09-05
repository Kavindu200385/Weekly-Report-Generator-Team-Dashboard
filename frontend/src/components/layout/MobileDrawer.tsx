import { useLocation, useNavigate } from "react-router-dom";
import type { User } from "@/types";
import { getAvatarColor } from "@/utils/avatar";
import { NavIcon } from "@/components/ui/NavIcon";
import { Btn } from "@/components/ui/Btn";
import { NAV, isNavItemActive } from "@/components/layout/Sidebar";

export function MobileDrawer({ isManager, me, onLogout, onClose }: { isManager: boolean; me: User; onLogout: () => void; onClose: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const items = NAV.filter(n => n.mgr === null || (isManager ? n.mgr : !n.mgr));
  const { bg } = getAvatarColor(me.id);

  return (
    <div className="mobile-drawer-overlay" onClick={onClose}>
      <div className="mobile-drawer" onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#7C3AED 0%,#5B21B6 100%)", padding: "22px 20px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".9"/><rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".6"/><rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" opacity=".6"/><rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" opacity=".9"/></svg>
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Sitrep</span>
          </div>
          <button onClick={onClose} aria-label="Close menu" style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,.15)", border: "none", color: "#fff", cursor: "pointer", fontSize: 18 }}>×</button>
        </div>

        <nav style={{ flex: 1, padding: "10px 0", overflowY: "auto" }}>
          {items.map(n => {
            const active = isNavItemActive(n, location.pathname, isManager);
            return (
              <button key={n.id} onClick={() => { navigate(n.path); onClose(); }} className="nb" style={{
                background: active ? "var(--accent-bg)" : "transparent",
                color: active ? "var(--accent)" : "var(--text-2)",
                fontWeight: active ? 700 : 500,
                minHeight: 44,
              }}>
                <span style={{ color: active ? "var(--accent)" : "var(--text-3)" }}><NavIcon id={n.id} /></span>
                {n.label}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: "14px 16px", borderTop: "1px solid var(--border)", background: "var(--raised)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff" }}>{me.initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{me.name}</div>
              <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 500, textTransform: "capitalize" }}>{me.role}</div>
            </div>
          </div>
          <Btn variant="ghost" size="sm" onClick={onLogout}>Sign out</Btn>
        </div>
      </div>
    </div>
  );
}
