import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Calendar as CalendarIcon, Clock, MapPin, Video, Search, Users, FileText,
  CheckCircle2, X, Filter, User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { gapAtendimentos, ticketCategoriaConfig as categoriaConfig, TicketCategoria, GapAtendimento } from "@/data/gapData";

const estadoConfig: Record<string, { label: string; color: string; dot: string }> = {
  agendado:  { label: "Agendado",  color: "bg-blue-50 text-blue-700 border-blue-200",       dot: "bg-blue-500" },
  concluido: { label: "Concluído", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  cancelado: { label: "Cancelado", color: "bg-red-50 text-red-700 border-red-200",          dot: "bg-red-500" },
  remarcar:  { label: "Remarcar",  color: "bg-amber-50 text-amber-700 border-amber-200",    dot: "bg-amber-500" },
};

const TODAY = "2025-12-16";

export default function GapAtendimentos() {
  const [filter, setFilter] = useState<"todos" | "hoje" | "agendados" | "concluidos">("agendados");
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState<"todas" | TicketCategoria>("todas");
  const [selected, setSelected] = useState<GapAtendimento | null>(null);

  const filtered = useMemo(() => {
    return gapAtendimentos
      .filter(a => {
        if (filter === "hoje") return a.data === TODAY;
        if (filter === "agendados") return a.estado === "agendado";
        if (filter === "concluidos") return a.estado === "concluido";
        return true;
      })
      .filter(a => categoria === "todas" || a.categoria === categoria)
      .filter(a => {
        if (!search) return true;
        const s = search.toLowerCase();
        return a.estudante.toLowerCase().includes(s) || a.matricula.includes(search) || a.motivo.toLowerCase().includes(s);
      })
      .sort((a, b) => (b.data + b.hora).localeCompare(a.data + a.hora));
  }, [filter, search, categoria]);

  const counts = {
    todos: gapAtendimentos.length,
    hoje: gapAtendimentos.filter(a => a.data === TODAY).length,
    agendados: gapAtendimentos.filter(a => a.estado === "agendado").length,
    concluidos: gapAtendimentos.filter(a => a.estado === "concluido").length,
  };

  const tabs: { key: typeof filter; label: string; count: number }[] = [
    { key: "todos", label: "Todos", count: counts.todos },
    { key: "hoje", label: "Hoje", count: counts.hoje },
    { key: "agendados", label: "Agendados", count: counts.agendados },
    { key: "concluidos", label: "Concluídos", count: counts.concluidos },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Agendamentos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sessões de apoio individual marcadas pelo GAP — psicológico, académico, vocacional e social.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Novo Agendamento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Agendamento</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-2"><Label>Estudante</Label><Input placeholder="Nome ou matrícula" /></div>
              <div className="space-y-2"><Label>Motivo</Label><Textarea placeholder="Descreva o motivo..." className="resize-none" rows={3} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(categoriaConfig) as TicketCategoria[]).map(c => (
                        <SelectItem key={c} value={c}>{categoriaConfig[c].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2"><Label>Data</Label><Input type="date" /></div>
                <div className="space-y-2"><Label>Hora</Label><Input type="time" /></div>
                <div className="space-y-2"><Label>Duração</Label><Input placeholder="50 min" /></div>
              </div>
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="helena">Dra. Helena Cabral</SelectItem>
                    <SelectItem value="joao">Dr. João Tavares</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
              <DialogClose asChild><Button>Agendar</Button></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total", value: counts.todos, icon: CalendarIcon, iconBg: "bg-muted text-muted-foreground" },
          { label: "Hoje", value: counts.hoje, icon: Clock, iconBg: "bg-primary/10 text-primary" },
          { label: "Agendados", value: counts.agendados, icon: CalendarIcon, iconBg: "bg-blue-50 text-blue-600" },
          { label: "Concluídos", value: counts.concluidos, icon: CheckCircle2, iconBg: "bg-emerald-50 text-emerald-600" },
        ].map(k => (
          <Card key={k.label} className="p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{k.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{k.value}</p>
              </div>
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", k.iconBg)}>
                <k.icon className="w-4 h-4" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Control box */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1 p-2 bg-muted/30 border-b border-border">
          {tabs.map(t => {
            const active = filter === t.key;
            return (
              <button key={t.key} onClick={() => setFilter(t.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium transition-all",
                  active ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                )}>
                {t.label}
                <span className={cn(
                  "ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded text-[10px] font-semibold tabular-nums",
                  active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>{t.count}</span>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center p-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar estudante, motivo, matrícula..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
          <div className="flex-1" />
          <Select value={categoria} onValueChange={v => setCategoria(v as typeof categoria)}>
            <SelectTrigger className={cn("w-[180px] h-9 text-xs", categoria !== "todas" && "border-primary/50 bg-primary/5 text-primary")}>
              <Filter className="w-3.5 h-3.5 mr-1.5 shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {(Object.keys(categoriaConfig) as TicketCategoria[]).map(c => (
                <SelectItem key={c} value={c}>{categoriaConfig[c].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(search || categoria !== "todas") && (
            <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground hover:text-destructive gap-1" onClick={() => { setSearch(""); setCategoria("todas"); }}>
              <X className="w-3.5 h-3.5" /> Limpar
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card className="p-10 text-center"><p className="text-sm text-muted-foreground">Nenhum agendamento encontrado</p></Card>
        ) : (
          filtered.map(a => {
            const cat = categoriaConfig[a.categoria];
            const est = estadoConfig[a.estado];
            return (
              <Card key={a.id} className="p-4 hover:bg-muted/30 hover:border-primary/30 transition-all cursor-pointer group" onClick={() => setSelected(a)}>
                <div className="flex items-center gap-4">
                  <div className="text-center w-14 shrink-0 py-1.5 rounded-lg bg-muted/40 group-hover:bg-primary/10 transition-colors">
                    <p className="text-lg font-bold text-foreground leading-none">{new Date(a.data).getDate()}</p>
                    <p className="text-[10px] text-muted-foreground uppercase mt-0.5">{new Date(a.data).toLocaleDateString("pt-AO", { month: "short" })}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{a.estudante}</p>
                      <Badge variant="outline" className={cn("text-[10px]", cat.color)}>{cat.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{a.motivo}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {a.responsavel}</span>
                      {a.sala && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {a.sala}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground tabular-nums">{a.hora}</p>
                      <p className="text-[10px] text-muted-foreground">{a.duracao}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] gap-1">
                      {a.tipo === "online" ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                      {a.tipo === "online" ? "Online" : "Presencial"}
                    </Badge>
                    <Badge variant="outline" className={cn("text-[10px] gap-1", est.color)}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", est.dot)} />
                      {est.label}
                    </Badge>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl p-0 gap-0 max-h-[90vh] overflow-y-auto">
          {selected && (() => {
            const cat = categoriaConfig[selected.categoria];
            const est = estadoConfig[selected.estado];
            const d = new Date(selected.data);
            return (
              <>
                {/* Header strip */}
                <div className="bg-gradient-to-br from-primary/5 via-card to-card border-b border-border p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-center w-16 shrink-0 py-2 rounded-lg bg-card border border-border shadow-sm">
                      <p className="text-2xl font-bold text-foreground leading-none">{d.getDate()}</p>
                      <p className="text-[10px] text-muted-foreground uppercase mt-1">{d.toLocaleDateString("pt-AO", { month: "short" })}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{selected.id}</span>
                        <Badge variant="outline" className={cn("text-[10px]", cat.color)}>{cat.label}</Badge>
                        <Badge variant="outline" className={cn("text-[10px] gap-1", est.color)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", est.dot)} /> {est.label}
                        </Badge>
                      </div>
                      <DialogTitle className="text-lg leading-tight">{selected.motivo}</DialogTitle>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {d.toLocaleDateString("pt-AO", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })} · {selected.hora} · {selected.duracao}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Estudante */}
                  <div className="rounded-lg border border-border p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{selected.estudante}</p>
                        <p className="text-[11px] text-muted-foreground">{selected.matricula} · {selected.curso}</p>
                      </div>
                    </div>
                  </div>

                  {/* Logística */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Hora</p>
                      <p className="text-sm font-semibold text-foreground mt-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-muted-foreground" />{selected.hora}</p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Duração</p>
                      <p className="text-sm font-semibold text-foreground mt-1">{selected.duracao}</p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Modalidade</p>
                      <p className="text-sm font-semibold text-foreground mt-1 flex items-center gap-1.5">
                        {selected.tipo === "online" ? <Video className="w-3.5 h-3.5 text-muted-foreground" /> : <MapPin className="w-3.5 h-3.5 text-muted-foreground" />}
                        {selected.tipo === "online" ? "Online" : "Presencial"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Local</p>
                      <p className="text-sm font-semibold text-foreground mt-1">{selected.sala ?? "—"}</p>
                    </div>
                  </div>

                  {/* Responsável */}
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">Responsável</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-pink-50 text-pink-700 flex items-center justify-center text-xs font-semibold">
                        {selected.responsavel.split(" ").slice(-2).map(n => n[0]).join("")}
                      </div>
                      <p className="text-sm font-medium text-foreground">{selected.responsavel}</p>
                    </div>
                  </div>

                  {/* Notas */}
                  {selected.notas && (
                    <div>
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5 mb-1.5">
                        <FileText className="w-3 h-3" /> Notas da sessão
                      </Label>
                      <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm text-foreground leading-relaxed border-l-2 border-l-primary/40">
                        {selected.notas}
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter className="px-6 py-3 border-t border-border bg-muted/20 gap-2">
                  {selected.estado === "agendado" && (
                    <>
                      <Button variant="outline" size="sm" className="gap-1.5"><CalendarIcon className="w-3.5 h-3.5" /> Remarcar</Button>
                      <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive"><X className="w-3.5 h-3.5" /> Cancelar</Button>
                      <Button size="sm" className="gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Marcar concluído</Button>
                    </>
                  )}
                  <DialogClose asChild><Button variant="outline" size="sm">Fechar</Button></DialogClose>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
