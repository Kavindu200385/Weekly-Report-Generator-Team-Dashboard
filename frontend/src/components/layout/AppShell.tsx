import { Navigate, Outlet } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { AIChatWidget } from "@/components/dashboard/AIChatWidget";

export function AppShell() {
  const { loading, me, isManager, logout } = useApp();

  if (loading) return null;
  if (!me) return <Navigate to="/login" replace />;

  return (
    <div style={{ display: "flex", height: "100%", background: "var(--bg)" }}>
      <Sidebar isManager={isManager} me={me} onLogout={logout} />
      <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Outlet />
      </div>
      {isManager && <AIChatWidget />}
    </div>
  );
}
