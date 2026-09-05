import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileTopBar } from "@/components/layout/MobileTopBar";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { AIChatWidget } from "@/components/dashboard/AIChatWidget";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { MQ } from "@/lib/breakpoints";

export function AppShell() {
  const { loading, me, isManager, logout } = useApp();
  const isMobile = useMediaQuery(MQ.mobile);
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (loading) return null;
  if (!me) return <Navigate to="/login" replace />;

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", height: "100%", background: "var(--bg)" }}>
      {isMobile ? <MobileTopBar onMenu={() => setDrawerOpen(true)} /> : <Sidebar isManager={isManager} me={me} onLogout={logout} />}
      {isMobile && drawerOpen && (
        <MobileDrawer isManager={isManager} me={me} onLogout={logout} onClose={() => setDrawerOpen(false)} />
      )}
      <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Outlet />
      </div>
      {isManager && <AIChatWidget />}
    </div>
  );
}
