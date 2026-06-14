import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckSquare, Clock, CheckCircle2, Search, X, Inbox, Send,
  Plus, GraduationCap, CalendarDays, Calendar, ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  finSolicitacoes, finTypeMeta, finStatusMeta,
  type FinType, type FinStatus,
} from "@/data/financasSolicitacoesData";

type EstadoFilter = "todos" | "pendentes" | "aprovadas" | "rejeitadas";

export default function FinancasSolicitacoes() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"recebidas" | "enviadas">("recebidas");
  const [estado, setEstado] = useState<EstadoFilter>("todos");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FinType | "todos">("todos");

  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newType, setNewType] = useState<FinType>("orcamento");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDest, setNewDest] = useState("");

  const directionFiltered = finSolicitacoes.filter(
    s => s.direction === (tab === "recebidas" ? "recebida" : "enviada")
  );

  const counts = useMemo(() => ({
    todos: directionFiltered.length,
    pendentes: directionFiltered.filter(s => s.status === "pendente").length,
    aprovadas: directionFiltered.filter(s => s.status === "aprovado").length,
    rejeitadas: directionFiltered.filter(s => s.status === "rejeitado").length,
  }), [directionFiltered]);

  const filtered = useMemo(() => {
    return directionFiltered
      .filter(s => {
        if (estado === "pendentes"  && s.status !== "pendente")  return false;
        if (estado === "aprovadas"  && s.status !== "aprovado")  return false;
        if (estado === "rejeitadas" && s.status !== "rejeitado") return false;
        if (typeFilter !== "todos" && s.type !== typeFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          if (!s.title.toLowerCase().includes(q)
            && !s.ref.toLowerCase().includes(q)
            && !s.requester.toLowerCase().includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [directionFiltered, estado, search, typeFilter]);

  const fmt = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const tabs: { key: EstadoFilter; label: string; count: number }[] = [
    { key: "todos",      label: "Todas",      count: counts.todos },
    { key: "pendentes",  label: "Pendentes",  count: counts.pendentes },
    { key: "aprovadas",  label: "Aprovadas",  count: counts.aprovadas },
    { key: "rejeitadas", label: "Rejeitadas", count: counts.rejeitadas },
  ];

  /* live clock */
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const liveTime = `${String(now.getHours()).padStart(2,"0")}h:${String(now.getMinutes()).padStart(2,"0")}min:${String(now.getSeconds()).padStart(2,"0")}s`;
  const todayLabel = new Date().toLocaleDateString("pt-PT", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const ANO_LETIVO = "2024 / 2025";

  const handleNewSubmit = () => {
    if (!newTitle.trim()) return;
    toast({ title: "Solicitação submetida", description: "O pedido foi enviado para aprovação." });
    setShowNewDialog(false);
    setNewTitle(""); setNewDesc(""); setNewDest(""); setNewType("orcamento");
  };

  const StatCell = ({ icon: Icon, label, value, tone }:{
    icon: LucideIcon; label: string; value: number; tone: "primary" | "amber" | "emerald" | "red";
  }) => {
    const toneCls: Record<typeof tone, string> = {
      primary: "text-primary bg-primary/10",
      amber:   "text-amber-600 bg-amber-50",
      emerald: "text-emerald-600 bg-emerald-50",
      red:     "text-red-600 bg-red-50",
    };
    return (
      <div className="flex items-center gap-3 px-5 py-4">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", toneCls[tone])}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
          <p className="text-xl font-bold text-foreground tabular-nums leading-tight mt-0.5">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-transparent px-5 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 space-y-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-wider font-semibold text-primary">
              <GraduationCap className="w-3.5 h-3.5" />
              Ano Letivo <span className="font-bold tabular-nums">{ANO_LETIVO}</span>
            </span>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2 leading-tight">
                <CheckSquare className="w-5 h-5 text-primary" /> Solicitações Financeiras
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Caixa de entrada de pedidos financeiros — analisar e acompanhar.
              </p>
            </div>
          </div>
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
            <Button size="sm" onClick={() => setShowNewDialog(true)} className="h-9 gap-1.5 text-xs shadow-md hover:shadow-lg transition-shadow">
              <Plus className="w-4 h-4" /> Nova Solicitação
            </Button>
          </div>
        </div>
      </div>

      {/* ── Hero stat strip ── */}
      <Card className="overflow-hidden p-0 gap-0 border-border">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border bg-gradient-to-r from-primary/[0.04] via-transparent to-transparent">
          <StatCell icon={Inbox}        label="Total"      value={counts.todos}      tone="primary" />
          <StatCell icon={Clock}        label="Pendentes"  value={counts.pendentes}  tone="amber" />
          <StatCell icon={CheckCircle2} label="Aprovadas"  value={counts.aprovadas}  tone="emerald" />
          <StatCell icon={X}            label="Rejeitadas" value={counts.rejeitadas} tone="red" />
        </div>
      </Card>

      {/* ── Minhas Solicitações ── */}
      <Card className="overflow-hidden border-border p-0 gap-0">
        {/* Section header */}
        <div className="px-5 py-3.5 border-b border-border bg-card flex items-center justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h2 className="text-[14px] font-semibold text-foreground flex items-center gap-2">
              <Inbox className="w-4 h-4 text-primary" />
              Minhas Solicitações
              <span className="text-[10px] font-medium text-muted-foreground tabular-nums px-1.5 py-0.5 rounded-md bg-muted ml-1">
                {filtered.length}
              </span>
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Ano lectivo {ANO_LETIVO}</p>
          </div>

          {/* Direção segmented */}
          <div className="flex bg-muted/60 rounded-lg p-0.5">
            {([
              { key: "recebidas" as const, label: "Recebidas", icon: Inbox, count: finSolicitacoes.filter(s => s.direction === "recebida").length },
              { key: "enviadas"  as const, label: "Enviadas",  icon: Send,  count: finSolicitacoes.filter(s => s.direction === "enviada").length },
            ]).map(t => (
              <button key={t.key}
                onClick={() => { setTab(t.key); setEstado("todos"); }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                  tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}>
                <t.icon className="w-3.5 h-3.5" />{t.label}
                <span className={cn(
                  "tabular-nums text-[10px] font-bold px-1.5 rounded-full ml-0.5",
                  tab === t.key ? "bg-primary/10 text-primary" : "bg-muted-foreground/15 text-muted-foreground"
                )}>{t.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar: search + filters */}
        <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Procurar por título, referência ou requerente…"
              className="pl-8 pr-8 h-9 text-xs bg-background border-border"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <Select value={typeFilter} onValueChange={(v: FinType | "todos") => setTypeFilter(v)}>
            <SelectTrigger className="w-[190px] h-9 text-xs bg-background border-border">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as categorias</SelectItem>
              {(Object.keys(finTypeMeta) as FinType[]).map(k => (
                <SelectItem key={k} value={k}>{finTypeMeta[k].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={estado} onValueChange={(v: EstadoFilter) => setEstado(v)}>
            <SelectTrigger className="w-[180px] h-9 text-xs bg-background border-border">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              {tabs.map(t => (
                <SelectItem key={t.key} value={t.key}>
                  <span className="flex items-center gap-2">
                    {t.key === "todos" ? "Todos os estados" : t.label}
                    <span className="tabular-nums text-[10px] font-semibold text-muted-foreground">({t.count})</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(search || typeFilter !== "todos" || estado !== "todos") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearch(""); setTypeFilter("todos"); setEstado("todos"); }}
              className="h-9 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <X className="w-3.5 h-3.5" /> Limpar
            </Button>
          )}
        </div>

        {/* Table-style header */}
        <div className="hidden md:grid grid-cols-[120px_1fr_130px_140px_120px_110px_28px] gap-3 px-5 py-2 bg-muted/10 border-b border-border text-[10px] uppercase tracking-[0.08em] font-semibold text-muted-foreground">
          <div>Referência</div>
          <div>Assunto</div>
          <div>Categoria</div>
          <div>{tab === "recebidas" ? "Requerente" : "Destinatário"}</div>
          <div>Submetido</div>
          <div>Estado</div>
          <div></div>
        </div>

        {/* Lista */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma solicitação corresponde aos filtros.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(s => {
              const tm = finTypeMeta[s.type];
              const st = finStatusMeta[s.status];
              const counterpart = s.direction === "recebida" ? s.requester : (s.destinatario ?? "—");
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => navigate(`/financas/solicitacoes/${s.id}`)}
                  className="w-full text-left hover:bg-muted/40 transition-colors group"
                >
                  {/* Desktop row */}
                  <div className="hidden md:grid grid-cols-[120px_1fr_130px_140px_120px_110px_28px] gap-3 px-5 py-3 items-center">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", st.dot)} />
                      <span className="font-mono text-[11px] text-muted-foreground truncate">{s.ref}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-foreground leading-tight truncate">{s.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5 line-clamp-1">{s.description}</p>
                    </div>
                    <div className="min-w-0">
                      <Badge variant="outline" className={cn("text-[10px] py-0 h-5 border gap-1", tm.cls)}>
                        <tm.icon className="w-2.5 h-2.5" /> {tm.label}
                      </Badge>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium text-foreground truncate">{counterpart}</p>
                      {s.direction === "recebida" && s.requesterRole && (
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{s.requesterRole}</p>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground tabular-nums flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {fmt(s.date)}
                    </div>
                    <div className="min-w-0">
                      <Badge variant="outline" className={cn("text-[10px] py-0 h-5 border font-medium", st.cls)}>
                        {st.label}
                      </Badge>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </div>

                  {/* Mobile row */}
                  <div className="md:hidden px-5 py-3 flex items-start gap-3">
                    <span className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", st.dot)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="font-mono text-[10.5px] text-muted-foreground">{s.ref}</span>
                        <Badge variant="outline" className={cn("text-[10px] py-0 h-4 border", st.cls)}>
                          {st.label}
                        </Badge>
                      </div>
                      <p className="text-[13px] font-semibold text-foreground leading-snug">{s.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{counterpart}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <Badge variant="outline" className={cn("text-[10px] py-0 h-4 border gap-1", tm.cls)}>
                          <tm.icon className="w-2.5 h-2.5" /> {tm.label}
                        </Badge>
                        <span className="text-[10.5px] text-muted-foreground tabular-nums ml-auto">{fmt(s.date)}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {/* New Request Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Send className="w-5 h-5 text-primary" /> Nova Solicitação</DialogTitle>
          </DialogHeader>
          <Separator />
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categoria</label>
              <Select value={newType} onValueChange={v => setNewType(v as FinType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(finTypeMeta) as FinType[]).map(k => <SelectItem key={k} value={k}>{finTypeMeta[k].label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assunto</label>
              <Input placeholder="Ex: Reforço orçamental Q2" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Destinatário</label>
              <Input placeholder="Ex: Magnífico Reitor" value={newDest} onChange={e => setNewDest(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Justificação</label>
              <Textarea rows={3} placeholder="Descreva o motivo do pedido..." value={newDesc} onChange={e => setNewDesc(e.target.value)} />
            </div>
          </div>
          <Separator />
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={handleNewSubmit} disabled={!newTitle.trim()} className="gap-1.5"><Send className="w-4 h-4" /> Submeter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
