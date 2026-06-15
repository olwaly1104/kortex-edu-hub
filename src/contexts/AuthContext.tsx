import React, { createContext, useContext, useState, useCallback } from "react";
import { User, UserRole, detectRole, currentStudent, currentProfessor, currentCoordenadorCurso, currentDecano, currentReitor, currentSecretaria, currentFinancas, currentGap, currentInscricoes, currentAcademica2, currentAdmin } from "@/data/mockData";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MIN_PASSWORD_LENGTH = 6;
const STORAGE_KEY = "upra.demo.session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });

  const persist = (u: User | null) => {
    setUser(u);
    try {
      if (u) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  };

  const login = useCallback((email: string, password: string) => {
    if (!email || !password) return { ok: false, error: "Email e palavra-passe são obrigatórios." };
    if (password.length < MIN_PASSWORD_LENGTH) return { ok: false, error: `Palavra-passe deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.` };
    const role = detectRole(email);
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
    const next = { ...mockUsers[role], email };
    persist(next);
    return { ok: true };
  }, []);

  const logout = useCallback(() => persist(null), []);

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
