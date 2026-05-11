import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut } from "lucide-react";

export default function InscricoesLayout() {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-14 border-b bg-card flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">Portal de Inscrições</p>
            <p className="text-[11px] text-muted-foreground">UPRA · Kortex Educação</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={logout} className="h-8 text-[12px] gap-1.5">
          <LogOut className="w-3.5 h-3.5" /> Sair
        </Button>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
