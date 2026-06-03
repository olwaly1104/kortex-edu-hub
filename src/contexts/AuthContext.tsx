import React, { createContext, useContext, useState, useCallback } from "react";
import { User, UserRole, detectRole, currentStudent, currentProfessor, currentCoordenadorCurso, currentDecano, currentReitor, currentSecretaria, currentFinancas, currentGap, currentInscricoes } from "@/data/mockData";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "upra_mock_user";

function loadStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadStoredUser());

  const login = useCallback((email: string, _password: string) => {
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
    };
    const nextUser = { ...mockUsers[role], email };
    setUser(nextUser);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    } catch {
      // ignore storage errors (private mode, quota, etc.)
    }
    return true;
  }, []);

  const logout = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setUser(null);
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
