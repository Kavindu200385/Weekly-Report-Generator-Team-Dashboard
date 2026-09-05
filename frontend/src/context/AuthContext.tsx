import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Role } from "@/types";
import { TOKEN_STORAGE_KEY } from "@/api/client";
import { queryClient } from "@/lib/queryClient";
import {
  login as apiLogin,
  register as apiRegister,
  getMe as apiGetMe,
  type BackendUser,
} from "@/api/auth.api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

function toAuthUser(u: BackendUser): AuthUser {
  return { id: String(u.id), name: u.name, email: u.email, role: u.role };
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, recaptchaToken?: string) => Promise<AuthUser>;
  register: (
    name: string,
    email: string,
    password: string,
    recaptchaToken: string,
    inviteToken?: string,
  ) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!stored) {
      setIsLoading(false);
      return;
    }
    setToken(stored);
    apiGetMe()
      .then((u) => setUser(toAuthUser(u)))
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string, recaptchaToken?: string) => {
    const res = await apiLogin(email, password, recaptchaToken);
    // A previous account's cached queries (reports, tasks, dashboard data…)
    // must never bleed into the next session in the same tab.
    queryClient.clear();
    localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
    setToken(res.token);
    const authUser = toAuthUser(res.user);
    setUser(authUser);
    return authUser;
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, recaptchaToken: string, inviteToken?: string) => {
      const res = await apiRegister(name, email, password, recaptchaToken, inviteToken);
      queryClient.clear();
      localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
      setToken(res.token);
      const authUser = toAuthUser(res.user);
      setUser(authUser);
      return authUser;
    },
    [],
  );

  const logout = useCallback(() => {
    queryClient.clear();
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
