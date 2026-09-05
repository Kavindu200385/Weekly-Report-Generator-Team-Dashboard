import { createContext, useContext } from "react";
import type { User } from "@/types";
import { useAuth } from "@/context/AuthContext";

function deriveInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

interface AppContextValue {
  loading: boolean;
  me: User | null;
  isManager: boolean;
  logout: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser, isLoading: authLoading, logout: authLogout } = useAuth();

  // me is the real authenticated user (from AuthContext/backend) — mapped
  // into the frontend's broader User shape. initials/joinedAt aren't part
  // of the backend profile response, so initials are derived client-side
  // and joinedAt is left blank (nothing currently reads it off `me`).
  const me: User | null = authUser
    ? { id: authUser.id, name: authUser.name, initials: deriveInitials(authUser.name), email: authUser.email, role: authUser.role, joinedAt: "" }
    : null;

  return (
    <AppContext.Provider value={{
      loading: authLoading, me, isManager: me?.role === "manager", logout: authLogout,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
