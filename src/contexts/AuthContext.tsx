import React, { createContext, useContext, useState, useCallback } from "react";
import { User, UserRole, detectRole, currentStudent, currentProfessor, currentCoordenadorCurso, currentDecano, currentReitor, currentSecretaria, currentFinancas, currentGap, currentInscricoes } from "@/data/mockData";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

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
    setUser({ ...mockUsers[role], email });
    return true;
  }, []);

  const logout = useCallback(() => setUser(null), []);

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
