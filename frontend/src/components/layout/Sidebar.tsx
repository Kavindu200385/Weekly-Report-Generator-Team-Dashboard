import { useLocation, useNavigate } from "react-router-dom";
import type { User } from "@/types";
import { getAvatarColor } from "@/utils/avatar";
import { NavIcon } from "@/components/ui/NavIcon";
import { Btn } from "@/components/ui/Btn";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { MQ } from "@/lib/breakpoints";

export const NAV = [
  { path: "/my-report",     id: "report-form",    label: "My Report",      mgr: false },
  { path: "/report-history",id: "report-history", label: "Report History", mgr: false },
  { path: "/dashboard",     id: "dashboard",       label: "Dashboard",      mgr: true  },
  { path: "/review-queue",  id: "review-queue",    label: "Review Queue",   mgr: true  },
  { path: "/team",          id: "user-mgmt",       label: "Team Members",   mgr: true  },
  { path: "/projects",      id: "projects",        label: "Projects",      mgr: true },
];

export function isNavItemActive(n: (typeof NAV)[number], pathname: string, isManager: boolean): boolean {
  return pathname === n.path
    || (n.id === "report-history" && pathname.startsWith("/reports/") && !isManager)
    || (n.id === "review-queue" && pathname.startsWith("/review/"));
}

export function Sidebar({ isManager, me, onLogout }: { isManager: boolean; me: User; onLogout: () => void }) {
  const { bg } = getAvatarColor(me.id);
  const location = useLocation();
  const navigate = useNavigate();
  const items = NAV.filter(n => n.mgr === null || (isManager ? n.mgr : !n.mgr));
  const isTablet = useMediaQuery(MQ.tablet);

  if (isTablet) {
    return (
      <div style={{ width: 64, flexShrink: 0, height: "100%", background: "#fff", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ background: "linear-gradient(135deg,#7C3AED 0%,#5B21B6 100%)", padding: "16px 0", width: "100%", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".9"/><rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".6"/><rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" opacity=".6"/><rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" opacity=".9"/></svg>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "10px 0", overflowY: "auto", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {items.map(n => {
            const active = isNavItemActive(n, location.pathname, isManager);
            return (
              <button key={n.id} onClick={() => navigate(n.path)} title={n.label} style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 44, height: 44, minWidth: 44, minHeight: 44, margin: "3px 0",
                borderRadius: 10, border: "none", cursor: "pointer",
                background: active ? "var(--accent-bg)" : "transparent",
                color: active ? "var(--accent)" : "var(--text-3)",
              }}>
                <NavIcon id={n.id} />
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "12px 0", borderTop: "1px solid var(--border)", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div title={me.name} style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff" }}>{me.initials}</div>
          <button onClick={onLogout} title="Sign out" style={{ width: 44, height: 44, minWidth: 44, minHeight: 44, background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3"/><path d="M11 11l3-3-3-3M14 8H6"/></svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: 240, flexShrink: 0, height: "100%", background: "#fff", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "linear-gradient(135deg,#7C3AED 0%,#5B21B6 100%)", padding: "22px 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".9"/><rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".6"/><rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" opacity=".6"/><rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" opacity=".9"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-.02em" }}>Sitrep</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.65)", fontWeight: 500, marginTop: 1 }}>
              {isManager ? "Manager workspace" : "Team workspace"}
            </div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "10px 0", overflowY: "auto" }}>
        <div style={{ padding: "8px 14px 4px", fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".06em" }}>
          {isManager ? "Manager" : "My Workspace"}
        </div>
        {items.map(n => {
          const active = isNavItemActive(n, location.pathname, isManager);
          return (
            <button key={n.id} onClick={() => navigate(n.path)} className="nb" style={{
              background: active ? "var(--accent-bg)" : "transparent",
              color: active ? "var(--accent)" : "var(--text-2)",
              fontWeight: active ? 700 : 500,
            }}>
              <span style={{ color: active ? "var(--accent)" : "var(--text-3)" }}><NavIcon id={n.id} /></span>
              {n.label}
              {active && <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />}
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
  );
}
