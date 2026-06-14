import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { coordAgendaEvents, announcements } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ChevronRight, Clock, CheckCircle, Play,
  Calendar as CalendarIcon, Megaphone, MapPin,
  GraduationCap, CalendarDays, Search, UserCheck,
  Building2, School,
} from "lucide-react";

import { Link } from "react-router-dom";

const typeStyles: Record<string, { bg: string; label: string }> = {
  urgente: { bg: "bg-destructive text-destructive-foreground", label: "Urgente" },
  academico: { bg: "bg-primary text-primary-foreground", label: "Académico" },
  geral: { bg: "bg-muted text-foreground", label: "Geral" },
};

const CATEGORY_META: Record<string, { label: string; cls: string }> = {
  aula:     { label: "Aula",     cls: "bg-blue-50 text-blue-700 border-blue-200" },
  teste:    { label: "Teste",    cls: "bg-amber-50 text-amber-700 border-amber-200" },
  entrega:  { label: "Entrega",  cls: "bg-violet-50 text-violet-700 border-violet-200" },
  exame:    { label: "Exame",    cls: "bg-red-50 text-red-700 border-red-200" },
  pessoal:  { label: "Pessoal",  cls: "bg-slate-50 text-slate-700 border-slate-200" },
  reuniao:  { label: "Reunião",  cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};


export default function FinancasInicio() {
  const { user } = useAuth();

  const TODAY_DATE = "2024-02-14";
  const ANO_LETIVO = "2024 / 2025";

  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const liveTime = `${String(now.getHours()).padStart(2, "0")}h:${String(now.getMinutes()).padStart(2, "0")}min:${String(now.getSeconds()).padStart(2, "0")}s`;

  const todayAgenda = coordAgendaEvents
    .filter(e => e.date === TODAY_DATE)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const todayLabel = new Date(TODAY_DATE).toLocaleDateString("pt-PT", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });

  const nowStr = "10:45";
  const getEventStatus = (e: typeof coordAgendaEvents[0]) => {
    if (e.endTime <= nowStr) return "concluída";
    if (e.startTime <= nowStr && e.endTime > nowStr) return "em_curso";
    return "agendada";
  };
  const statusConfig: Record<string, { label: string; icon: React.ElementType; variant: "default" | "outline" }> = {
    concluída: { label: "Concluída", icon: CheckCircle, variant: "outline" },
    em_curso: { label: "Em Curso", icon: Play, variant: "default" },
    agendada: { label: "Agendada", icon: Clock, variant: "outline" },
  };

  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filteredAgenda = q
    ? todayAgenda.filter(e =>
        e.title.toLowerCase().includes(q) ||
        (e.room ?? "").toLowerCase().includes(q))
    : todayAgenda;
  const filteredAnnouncements = q
    ? announcements.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q))
    : announcements;

  const presencaPct = user?.presence ?? "96%";

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-transparent px-5 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          {/* Left: ano letivo pill, then greeting */}
          <div className="min-w-0 space-y-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-wider font-semibold text-primary">
              <GraduationCap className="w-3.5 h-3.5" />
              Ano Letivo <span className="font-bold tabular-nums">{ANO_LETIVO}</span>
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-foreground leading-tight">
                Bom dia, Dr. Manuel Sousa 👋
              </h1>
              <p className="text-sm font-medium text-foreground/80 mt-0.5">
                {user?.position ?? "Diretor Financeiro"}
              </p>
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground">
                  <Building2 className="w-3 h-3 text-muted-foreground" />
                  {user?.department ?? "Departamento Financeiro"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground">
                  <School className="w-3 h-3 text-muted-foreground" />
                  Universidade Privada De Angola
                </span>
              </div>
            </div>
          </div>


          {/* Right: date/time pill + minha presença small box below */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="inline-flex items-stretch rounded-md border border-border bg-card overflow-hidden text-[11px] uppercase tracking-wider font-medium shadow-sm">
              <span className="flex items-center gap-1.5 px-2.5 py-1 text-foreground capitalize">
                <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />{todayLabel}
              </span>
              <span className="w-px bg-border" />
              <span className="flex items-center gap-1.5 px-2.5 py-1 font-mono tabular-nums text-primary bg-muted/30">
                <Clock className="w-3.5 h-3.5" />{liveTime}
              </span>
            </div>
            <div className="rounded-md border border-border bg-card px-3 py-2 flex items-center gap-2 shadow-sm">
              <div className="w-7 h-7 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                <UserCheck className="w-3.5 h-3.5 text-accent" />
              </div>
              <div className="leading-tight">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Minha Presença
                </p>
                <p className="text-sm font-bold text-accent tabular-nums">{presencaPct}</p>
              </div>
            </div>
          </div>

        </div>
      </div>




      {/* Agenda + Anúncios */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" /> Agenda de Hoje
            </h2>
            <Link to="/financas/calendario" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver calendário <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {filteredAgenda.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {q ? "Sem resultados" : "Sem eventos hoje 🎉"}
            </p>
          ) : (
            <div className="divide-y divide-border">
              {filteredAgenda.map(evento => {
                const status = getEventStatus(evento);
                const cfg = statusConfig[status];
                const StatusIcon = cfg.icon;
                const isActive = status === "em_curso";
                return (
                  <div key={evento.id} className={`flex items-center gap-4 px-4 py-3.5 transition-colors ${isActive ? "bg-primary/5" : "hover:bg-muted/30"}`}>
                    <div className="text-center shrink-0 w-14">
                      <p className={`text-sm font-bold ${isActive ? "text-primary" : "text-foreground"}`}>{evento.startTime}</p>
                      <p className="text-[10px] text-muted-foreground">{evento.endTime}</p>
                    </div>
                    <div className="w-0.5 h-10 rounded-full shrink-0" style={{ background: evento.color }} />
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm leading-tight ${isActive ? "text-primary" : "text-foreground"}`}>{evento.title}</p>
                      {evento.room && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{evento.room}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {(() => {
                        const cat = CATEGORY_META[evento.type] ?? { label: evento.type, cls: "bg-slate-50 text-slate-700 border-slate-200" };
                        return (
                          <Badge variant="outline" className={`text-[10px] ${cat.cls}`}>{cat.label}</Badge>
                        );
                      })()}
                      <Badge variant={isActive ? "default" : "outline"} className="text-[10px] gap-1">
                        <StatusIcon className="w-3 h-3" /> {cfg.label}
                      </Badge>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-secondary" /> Anúncios
              <Badge variant="outline" className="text-[10px] font-mono">{filteredAnnouncements.length}</Badge>
            </h2>
            <Link to="/financas/anuncios" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {filteredAnnouncements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Sem resultados</p>
            ) : filteredAnnouncements.slice(0, 3).map(an => {
              const style = typeStyles[an.type] || typeStyles.geral;
              return (
                <div key={an.id} className="px-3.5 py-3 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge className={`${style.bg} text-[10px]`}>{style.label}</Badge>
                    <span className="text-[11px] text-muted-foreground ml-auto">{an.date}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground line-clamp-1 leading-tight">{an.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{an.content}</p>
                  <p className="text-[11px] text-muted-foreground mt-1.5">— {an.author}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
