import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Megaphone, ClipboardCheck, GraduationCap, MapPin, LogIn, Clock } from "lucide-react";
import { FinHeader } from "@/pages/financas/_FinHeader";

export default function ProfessorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const presencaPill = (
    <div className="inline-flex items-stretch rounded-md border border-border bg-card overflow-hidden text-[11px] uppercase tracking-wider font-medium shadow-sm">
      <span className="flex items-center gap-1.5 px-2.5 py-1 text-foreground">
        <ClipboardCheck className="w-3.5 h-3.5 text-muted-foreground" />
        Minha Presença
      </span>
      <span className="w-px bg-border" />
      <span className="flex items-center gap-1.5 px-2.5 py-1 tabular-nums font-semibold text-primary bg-muted/30 tracking-tight">
        0%
      </span>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <FinHeader
        title={`Bom dia, ${user?.name?.split(" ").pop() || "Professor"}`}
        subtitle="Painel do Docente"
        icon={<GraduationCap className="w-5 h-5 text-primary" />}
        right={presencaPill}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" /> Agenda Hoje
            </h2>
          </div>
          <div className="divide-y divide-border">
            <div className="flex items-center gap-4 px-4 py-3 rounded-md bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/15 transition-colors">
              <div className="text-center shrink-0 w-12">
                <p className="text-sm font-bold text-primary tabular-nums">10:00</p>
                <p className="text-[10px] text-muted-foreground tabular-nums">12:00</p>
              </div>
              <div className="w-1 h-12 rounded-full shrink-0 bg-primary" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight truncate text-foreground">Teoria da Arquitectura I</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />Sala A-204</span>
                  <span>ARQ • 1º Ano • T1</span>
                </div>
              </div>
              <Badge className="text-[10px] gap-1.5 font-medium shrink-0 bg-primary/15 text-primary border border-primary/25 hover:bg-primary/15">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> A Decorrer
              </Badge>
              <div className="shrink-0">
                <Button
                  size="sm"
                  onClick={() => navigate("/professor/aula/aula-demo")}
                  className="h-8 px-3 text-[11px] gap-1.5 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" /> Entrar na Aula
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-secondary" /> Anúncios
            </h2>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
              <Megaphone className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Sem anúncios</p>
            <p className="text-xs text-muted-foreground mt-1">Não existem comunicados recentes.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
