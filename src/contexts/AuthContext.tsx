import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { User, UserRole, detectRole, currentStudent, currentProfessor, currentCoordenadorCurso, currentDecano, currentReitor, currentSecretaria, currentFinancas, currentGap, currentInscricoes, currentAcademica2, currentAdmin } from "@/data/mockData";
import { syncDocentesFromDb, syncStaffFromDb } from "@/lib/peopleStorage";

interface LoginOptions {
  sourceEmail?: string;
  displayName?: string;
  /** Real DB role from public.user_roles (e.g. "gap", "financas", "estudante"...). */
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, options?: LoginOptions) => { ok: boolean; error?: string };
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MIN_PASSWORD_LENGTH = 6;
const STORAGE_KEY = "upra.demo.session";

// Map the DB role string to the internal UserRole used to pick a mock-user template.
function dbRoleToUserRole(dbRole?: string): UserRole | null {
  switch ((dbRole || "").toLowerCase()) {
    case "admin": return "admin";
    case "estudante": return "student";
    case "professor": return "professor";
    case "coordenador": return "coordenador_curso";
    case "decano": return "decano";
    case "reitor": return "reitor";
    case "financas": return "financas";
    case "academica": return "secretaria";
    case "gap": return "gap";
    case "inscricoes": return "inscricoes";
    case "academica2": return "academica2";
    default: return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });

  // Refresh institutional people cache from real DB whenever a user is active.
  useEffect(() => {
    if (!user) return;
    syncDocentesFromDb().catch(() => {});
    syncStaffFromDb().catch(() => {});
  }, [user?.email]);

  const persist = (u: User | null) => {
    setUser(u);
    try {
      if (u) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  };

  const login = useCallback((email: string, password: string, options?: LoginOptions) => {
    if (!email || !password) return { ok: false, error: "Email e palavra-passe são obrigatórios." };
    if (password.length < MIN_PASSWORD_LENGTH) return { ok: false, error: `Palavra-passe deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.` };
    const accountEmail = (options?.sourceEmail || email).trim().toLowerCase();
    // Prefer the real DB role; only fall back to email-prefix detection when missing.
    const role = dbRoleToUserRole(options?.role) ?? detectRole(email);
    const mockUsers: Record<UserRole, User> = {
      student: currentStudent,
      professor: currentProfessor,
      coordenador_curso: currentCoordenadorCurso,
      decano: currentDecano,
      reitor: currentReitor,
      secretaria: currentSecretaria,
      financas: currentFinancas,
      gap: currentGap,
      inscricoes: currentInscricoes,
      academica2: currentAcademica2,
      admin: currentAdmin,
    };
    const next = { ...mockUsers[role], email: accountEmail, name: options?.displayName || mockUsers[role].name };
    persist(next);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    persist(null);
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
