import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import logoUpra from "@/assets/logo-upra.asset.json";

export default function InscricoesLayout() {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-14 border-b bg-card flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center p-1">
            <img src={logoUpra.url} alt="UPRA" className="w-full h-full object-contain" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">Portal de Inscrições</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">UPRA · Universidade Privada de Angola</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={logout} className="h-8 text-[12px] gap-1.5">
          <LogOut className="w-3.5 h-3.5" /> Sair
        </Button>
      </header>
      <main className="flex-1 flex flex-col min-h-0">
        <Outlet />
      </main>
    </div>
  );
}
