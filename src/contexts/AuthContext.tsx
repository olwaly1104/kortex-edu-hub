import React, { createContext, useContext, useState, useCallback } from "react";
import { User, UserRole, detectRole, currentStudent, currentProfessor, currentCoordenadorCurso, currentDecano, currentReitor, currentSecretaria, currentFinancas, currentGap, currentInscricoes, currentAcademica2 } from "@/data/mockData";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MIN_PASSWORD_LENGTH = 6;

const STORAGE_KEY = "upra.demo.session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Session persists in sessionStorage so reloads/deep-links don't kick the user
  // back to the login page. Cleared on tab close or explicit logout.
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((email: string, password: string) => {
    if (!email || !password) {
      return { ok: false, error: "Email e palavra-passe são obrigatórios." };
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return { ok: false, error: `Palavra-passe deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.` };
    }
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
    };
    const next = { ...mockUsers[role], email };
    setUser(next);
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);


  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
