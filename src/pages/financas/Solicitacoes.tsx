import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Clock, CheckCircle2, Search, X, Inbox, Send,
  Plus, GraduationCap, CalendarDays, Calendar, ArrowUpRight,
  AlertTriangle, BadgeCheck, ChevronLeft, ChevronRight,
  Paperclip, FileText, Trash2, ArrowRight, Check, Rocket,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { isInstitutionLive } from "@/pages/financas/_FinHeader";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import {
  finTypeMeta, finStatusMeta,
  type FinType, type FinStatus, type FinSolicitacao,
} from "@/data/financasSolicitacoesData";
import { useFinSolicitacoes, createFinSolicitacao } from "@/hooks/useFinSolicitacoes";

type EstadoFilter = "todos" | "pendentes" | "atrasadas" | "em_execucao" | "executadas" | "rejeitadas";

export default function FinancasSolicitacoes() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"recebidas" | "enviadas">("recebidas");
  const [estado, setEstado] = useState<EstadoFilter>("todos");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FinType | "todos">("todos");

  const [showNewDialog, setShowNewDialog] = useState(false);
  const [wizStep, setWizStep] = useState<1 | 2 | 3>(1);
  const [newType, setNewType] = useState<FinType | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newValor, setNewValor] = useState("");
  const [newPrazoDe, setNewPrazoDe] = useState<Date | undefined>(undefined);
  const [newPrazoAte, setNewPrazoAte] = useState<Date | undefined>(undefined);
  const [newFiles, setNewFiles] = useState<{ name: string; size: string }[]>([]);

  // Auto-routing by category
  const ROUTING: Record<FinType, { destinatario: string; responsavel: string; description: string; needsValor: boolean }> = {
    reembolso:   { destinatario: "Direcção Académica",  responsavel: "Dra. Helena Costa · Direcção Académica",      description: "Reembolso de despesas profissionais já incorridas.",  needsValor: true },
    orcamento:   { destinatario: "Magnífico Reitor",    responsavel: "Prof. Dr. António Mendes · Reitor",            description: "Pedido de reforço ou ajuste ao orçamento aprovado.",  needsValor: true },
    fornecedor:  { destinatario: "Conselho de Gestão",  responsavel: "Conselho de Gestão · Órgão Colegial",          description: "Aprovação de pagamento a fornecedores externos.",     needsValor: true },
    antecipacao: { destinatario: "Magnífico Reitor",    responsavel: "Prof. Dr. António Mendes · Reitor",            description: "Adiantamento de verba para missão ou despesa futura.", needsValor: true },
    verba:       { destinatario: "Conselho de Gestão",  responsavel: "Conselho de Gestão · Órgão Colegial",          description: "Solicitação de verba extraordinária não orçamentada.", needsValor: true },
    ferias:      { destinatario: "Recursos Humanos",    responsavel: "Sra. Isabel Tavares · Direcção de RH",         description: "Marcação ou alteração de período de férias.",          needsValor: false },
    licenca:     { destinatario: "Recursos Humanos",    responsavel: "Sra. Isabel Tavares · Direcção de RH",         description: "Assuntos pessoais — licenças, ausências e justificações.", needsValor: false },
    declaracao:  { destinatario: "Secretaria Geral",    responsavel: "Sec. Geral · Apoio Institucional",             description: "Emissão de declarações, certidões ou comprovativos.",  needsValor: false },
    material:    { destinatario: "Logística & Compras", responsavel: "Sr. Paulo Neves · Logística",                  description: "Requisição de material de escritório ou equipamento.", needsValor: true },
    formacao:    { destinatario: "Recursos Humanos",    responsavel: "Sra. Isabel Tavares · Direcção de RH",         description: "Pedido de inscrição em formações ou conferências.",    needsValor: true },
    ti:          { destinatario: "Departamento TI",     responsavel: "Eng. Rui Cabral · Direcção de TI",             description: "Acessos, equipamentos ou suporte informático.",        needsValor: false },
    outro:       { destinatario: "Secretaria Geral",    responsavel: "Sec. Geral · Apoio Institucional",             description: "Outras solicitações institucionais não classificadas.", needsValor: false },
  };


  const previewRef = useMemo(() => {
    const n = 412 + finSolicitacoes.filter(s => s.direction === "enviada").length + 1;
    return `REQ-2025-${String(n).padStart(4, "0")}`;
  }, [showNewDialog]);

  const openWizard = () => {
    setNewType(null); setNewTitle(""); setNewDesc(""); setNewValor("");
    setNewPrazoDe(undefined); setNewPrazoAte(undefined); setNewFiles([]); setWizStep(1);
    setShowNewDialog(true);
  };

  const fmtPrazo = (d?: Date) => {
    if (!d) return "—";
    return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });
  };
  const fmtPrazoShort = (d?: Date) => d ? d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" }) : "Escolher";
  const fmtKz = (v: string) => {
    const n = Number(v.replace(/[^\d]/g, ""));
    if (!n) return "—";
    return new Intl.NumberFormat("pt-AO").format(n) + " Kz";
  };
  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const arr = Array.from(list).map(f => ({ name: f.name, size: `${(f.size / 1024).toFixed(0)} KB` }));
    setNewFiles(prev => [...prev, ...arr]);
  };

  const directionFiltered = finSolicitacoes.filter(s => s.direction === (tab === "recebidas" ? "recebida" : "enviada"));

  const counts = useMemo(() => ({
    todos: directionFiltered.length,
    pendentes: directionFiltered.filter(s => s.status === "pendente").length,
    atrasadas: directionFiltered.filter(s => s.status === "atrasado").length,
    em_execucao: directionFiltered.filter(s => s.status === "em_execucao").length,
    executadas: directionFiltered.filter(s => s.status === "executada").length,
    rejeitadas: directionFiltered.filter(s => s.status === "rejeitado").length,
  }), [directionFiltered]);

  const filtered = useMemo(() => {
    return directionFiltered
      .filter(s => {
        if (estado === "pendentes"  && s.status !== "pendente")  return false;
        if (estado === "atrasadas"  && s.status !== "atrasado")  return false;
        if (estado === "em_execucao" && s.status !== "em_execucao") return false;
        if (estado === "executadas" && s.status !== "executada") return false;
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
    { key: "atrasadas",  label: "Em atraso",  count: counts.atrasadas },
    { key: "em_execucao", label: "Em execução", count: counts.em_execucao },
    { key: "executadas", label: "Executadas", count: counts.executadas },
    { key: "rejeitadas", label: "Rejeitadas", count: counts.rejeitadas },
  ];

  const { user } = useAuth();
  const [now, setNow] = useState<Date>(new Date());
  const [live, setLive] = useState<boolean>(() => isInstitutionLive(user?.email));
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const recheck = () => setLive(isInstitutionLive(user?.email));
    recheck();
    window.addEventListener("focus", recheck);
    window.addEventListener("storage", recheck);
    return () => {
      window.removeEventListener("focus", recheck);
      window.removeEventListener("storage", recheck);
    };
  }, [user?.email]);
  const liveTime = `${String(now.getHours()).padStart(2,"0")}h:${String(now.getMinutes()).padStart(2,"0")}min:${String(now.getSeconds()).padStart(2,"0")}s`;
  const todayLabel = now.toLocaleDateString("pt-PT", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const ANO_LETIVO = "2024 / 2025";

  const handleNewSubmit = () => {
    if (!newType || !newTitle.trim() || !newDesc.trim()) return;
    toast({ title: "Solicitação submetida", description: `${previewRef} · enviada para ${ROUTING[newType].destinatario}.` });
    setShowNewDialog(false);
  };

  const StatCell = ({ icon: Icon, label, value, tone }:{
    icon: LucideIcon; label: string; value: number; tone: "primary" | "amber" | "orange" | "emerald" | "teal" | "red";
  }) => {
    const toneCls: Record<typeof tone, string> = {
      primary: "text-primary bg-primary/10",
      amber:   "text-amber-600 bg-amber-50",
      orange:  "text-orange-600 bg-orange-50",
      emerald: "text-emerald-600 bg-emerald-50",
      teal:    "text-teal-600 bg-teal-50",
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
            {live ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-wider font-semibold text-primary">
                <GraduationCap className="w-3.5 h-3.5" />
                Ano Letivo <span className="font-bold tabular-nums">{ANO_LETIVO}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] uppercase tracking-wider font-semibold text-amber-800">
                <Rocket className="w-3.5 h-3.5" />
                Onboarding
              </span>
            )}
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2 leading-tight">
                Minhas Solicitações
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Pedidos institucionais — financeiros, pessoais e administrativos.
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
            <Button size="sm" onClick={openWizard} className="h-9 gap-1.5 text-xs shadow-md hover:shadow-lg transition-shadow">
              <Plus className="w-4 h-4" /> Nova Solicitação
            </Button>
          </div>
        </div>
      </div>

      {/* ── Hero stat strip ── */}
      <Card className="overflow-hidden p-0 gap-0 border-border">
        <div className="grid grid-cols-3 sm:grid-cols-6 divide-x divide-border bg-gradient-to-r from-primary/[0.04] via-transparent to-transparent">
          <StatCell icon={Inbox}          label="Total"      value={counts.todos}      tone="primary" />
          <StatCell icon={Clock}          label="Pendentes"  value={counts.pendentes}  tone="amber" />
          <StatCell icon={AlertTriangle}  label="Em atraso"  value={counts.atrasadas}  tone="orange" />
          <StatCell icon={CheckCircle2}   label="Em execução" value={counts.em_execucao} tone="emerald" />
          <StatCell icon={BadgeCheck}     label="Executadas" value={counts.executadas} tone="teal" />
          <StatCell icon={X}              label="Rejeitadas" value={counts.rejeitadas} tone="red" />
        </div>
      </Card>

      {/* ── Filtros / Toolbar ── */}
      <Card className="overflow-hidden border-border p-0 gap-0">
        {/* Section header */}
        <div className="px-5 py-3.5 border-b border-border bg-card flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-[14px] font-semibold text-foreground flex items-center gap-2">
            <Inbox className="w-4 h-4 text-primary" />
            Minhas Solicitações
            <span className="text-[10px] font-medium text-muted-foreground tabular-nums px-1.5 py-0.5 rounded-md bg-muted ml-1">
              {filtered.length}
            </span>
          </h2>

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
        <div className="px-5 py-3 bg-muted/20 flex items-center gap-2 flex-wrap">
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
      </Card>

      {/* ── Resultados ── */}
      <Card className="overflow-hidden border-border p-0 gap-0">
        {/* Results header */}
        <div className="px-5 py-2.5 bg-card border-b border-border flex items-center justify-between gap-3">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
            Resultados <span className="text-foreground tabular-nums ml-1">({filtered.length})</span>
          </p>
        </div>

        {/* Table-style header */}
        <div className="hidden md:grid grid-cols-[120px_1fr_130px_140px_120px_110px_28px] gap-3 px-5 py-2 bg-muted/10 border-b border-border text-[10px] uppercase tracking-[0.08em] font-semibold text-muted-foreground">
          <div>Referência</div>
          <div>Assunto</div>
          <div>Categoria</div>
          <div>Requerente</div>
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
              const counterpart = s.requester;
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
                      {s.requesterRole && (
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

      {/* ─── Nova Solicitação — Wizard ─── */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-[640px] p-0 gap-0 overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b border-border bg-gradient-to-br from-primary/[0.06] via-background to-background">
            <div className="min-w-0">
              <DialogTitle className="text-[15px] font-semibold flex items-center gap-2 leading-tight">
                <Send className="w-4 h-4 text-primary" /> Nova Solicitação
              </DialogTitle>
              <p className="text-[11.5px] text-muted-foreground mt-1">
                {wizStep === 1 && "Escolha a categoria — o destinatário é atribuído automaticamente."}
                {wizStep === 2 && "Descreva o pedido com clareza e anexe documentos comprovativos."}
                {wizStep === 3 && "Reveja os detalhes antes de submeter o pedido."}
              </p>
            </div>


            {/* Stepper */}
            <ol className="mt-4 flex items-center gap-2">
              {([
                { n: 1 as const, label: "Categoria" },
                { n: 2 as const, label: "Detalhes" },
                { n: 3 as const, label: "Revisão" },
              ]).map((s, i, arr) => {
                const done = wizStep > s.n;
                const active = wizStep === s.n;
                return (
                  <li key={s.n} className="flex items-center gap-2 flex-1">
                    <button
                      type="button"
                      disabled={s.n > wizStep}
                      onClick={() => setWizStep(s.n)}
                      className={cn(
                        "flex items-center gap-1.5 text-[11px] font-semibold transition-colors",
                        active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground/60",
                        s.n <= wizStep ? "cursor-pointer" : "cursor-not-allowed"
                      )}
                    >
                      <span className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold tabular-nums shrink-0",
                        active ? "bg-primary text-primary-foreground ring-4 ring-primary/15" :
                        done   ? "bg-emerald-500 text-white" :
                                 "bg-muted text-muted-foreground"
                      )}>
                        {done ? <Check className="w-3 h-3" strokeWidth={3} /> : s.n}
                      </span>
                      {s.label}
                    </button>
                    {i < arr.length - 1 && <span className={cn("h-px flex-1", done ? "bg-emerald-500/50" : "bg-border")} />}
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Body */}
          <div className="px-6 py-5 max-h-[55vh] overflow-y-auto">
            {/* STEP 1 — Categoria */}
            {wizStep === 1 && (
              <div className="grid grid-cols-2 gap-2.5">
                {(Object.keys(finTypeMeta) as FinType[]).map(k => {
                  const m = finTypeMeta[k];
                  const r = ROUTING[k];
                  const selected = newType === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => { setNewType(k); }}
                      className={cn(
                        "text-left rounded-lg border p-3 transition-all hover:shadow-sm",
                        selected ? "border-primary bg-primary/[0.04] ring-2 ring-primary/15" : "border-border bg-background hover:border-primary/40"
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={cn("w-8 h-8 rounded-md border flex items-center justify-center shrink-0", m.cls)}>
                          <m.icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-[13px] font-semibold text-foreground leading-tight">{m.label}</p>
                            {selected && <Check className="w-3.5 h-3.5 text-primary shrink-0" strokeWidth={3} />}
                          </div>
                          <p className="text-[10.5px] text-muted-foreground mt-1 leading-snug line-clamp-2">{r.description}</p>
                          <p className="text-[10px] text-muted-foreground/80 mt-1.5 flex items-center gap-1">
                            <ArrowRight className="w-2.5 h-2.5" />
                            <span className="font-medium text-foreground/80 truncate">{r.destinatario}</span>
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* STEP 2 — Detalhes */}
            {wizStep === 2 && newType && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-md border border-border bg-muted/30">
                  <div className={cn("w-7 h-7 rounded-md border flex items-center justify-center shrink-0", finTypeMeta[newType].cls)}>
                    {(() => { const I = finTypeMeta[newType].icon; return <I className="w-3.5 h-3.5" />; })()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-foreground leading-tight">{finTypeMeta[newType].label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Destinatário: <span className="font-medium text-foreground/80">{ROUTING[newType].destinatario}</span></p>
                  </div>
                  <button type="button" onClick={() => setWizStep(1)} className="text-[10.5px] text-primary hover:underline font-medium shrink-0">Alterar</button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Assunto <span className="text-destructive">*</span></label>
                  <Input placeholder="Ex: Reforço orçamental Q2 — Departamento Financeiro" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="h-9 text-[13px]" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {ROUTING[newType].needsValor && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Valor (Kz)</label>
                      <Input placeholder="0" value={newValor} onChange={e => setNewValor(e.target.value.replace(/[^\d]/g, ""))} className="h-9 text-[13px] tabular-nums font-mono" />
                    </div>
                  )}
                  <div className={cn("space-y-1.5", !ROUTING[newType].needsValor && "col-span-2")}>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Prazo pretendido</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("h-9 text-[12px] justify-start gap-1.5 font-normal", !newPrazoDe && "text-muted-foreground")}>
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">De</span>
                            {fmtPrazoShort(newPrazoDe)}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarPicker mode="single" selected={newPrazoDe} onSelect={setNewPrazoDe} initialFocus className="p-3 pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("h-9 text-[12px] justify-start gap-1.5 font-normal", !newPrazoAte && "text-muted-foreground")}>
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Até</span>
                            {fmtPrazoShort(newPrazoAte)}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarPicker mode="single" selected={newPrazoAte} onSelect={setNewPrazoAte} disabled={(d) => newPrazoDe ? d < newPrazoDe : false} initialFocus className="p-3 pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Justificação <span className="text-destructive">*</span></label>
                  <Textarea rows={4} placeholder="Descreva o motivo do pedido, contexto e impacto esperado…" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="text-[13px] resize-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Anexos</label>
                  <label className="flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/[0.02] transition-colors cursor-pointer py-5 px-4">
                    <Paperclip className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[11.5px] text-muted-foreground"><span className="text-primary font-semibold">Carregar ficheiros</span> · PDF, imagens ou folhas (máx 10MB)</span>
                    <input type="file" multiple className="sr-only" onChange={e => addFiles(e.target.files)} />
                  </label>
                  {newFiles.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {newFiles.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border bg-background">
                          <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="text-[12px] font-medium text-foreground truncate flex-1">{f.name}</span>
                          <span className="text-[10px] text-muted-foreground tabular-nums">{f.size}</span>
                          <button type="button" onClick={() => setNewFiles(p => p.filter((_, j) => j !== i))} className="w-5 h-5 rounded inline-flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3 — Revisão */}
            {wizStep === 3 && newType && (
              <div className="space-y-3">
                <div className="rounded-lg border border-border bg-background overflow-hidden">
                  <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center gap-2">
                    <Badge variant="outline" className={cn("text-[10px] gap-1 px-2 py-0.5", finTypeMeta[newType].cls)}>
                      {(() => { const I = finTypeMeta[newType].icon; return <I className="w-2.5 h-2.5" />; })()}
                      {finTypeMeta[newType].label}
                    </Badge>
                    <span className="text-[10.5px] text-muted-foreground font-mono ml-auto">{previewRef}</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Assunto</p>
                      <p className="text-[14px] font-semibold text-foreground leading-tight">{newTitle || "—"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                      <ReviewCell label="Requerente" value="Dr. Manuel Sousa" sub="Direcção Financeira" />
                      <ReviewCell label="Destinatário" value={ROUTING[newType].destinatario} sub="Atribuição automática" />
                      <ReviewCell label="Submetido" value={new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })} />
                      <ReviewCell label="Prazo" value={newPrazoDe || newPrazoAte ? `${fmtPrazo(newPrazoDe)} → ${fmtPrazo(newPrazoAte)}` : "—"} />
                      {ROUTING[newType].needsValor && <ReviewCell label="Valor" value={fmtKz(newValor)} mono />}
                      <ReviewCell label="Anexos" value={`${newFiles.length} ficheiro${newFiles.length === 1 ? "" : "s"}`} />
                    </div>
                    <div className="pt-2 border-t border-border">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Justificação</p>
                      <p className="text-[12.5px] text-foreground/85 leading-relaxed whitespace-pre-line">{newDesc || "—"}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2 px-3 py-2 rounded-md border border-amber-200 bg-amber-50/50 text-[11px] text-amber-900">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>Ao submeter, o pedido será enviado para <span className="font-semibold">{ROUTING[newType].destinatario}</span> e ficará pendente de aprovação.</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-border bg-muted/15 flex items-center justify-between gap-2">
            <Button variant="ghost" size="sm" onClick={() => wizStep === 1 ? setShowNewDialog(false) : setWizStep((wizStep - 1) as 1 | 2 | 3)} className="h-8 text-[12px] gap-1">
              {wizStep === 1 ? <X className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              {wizStep === 1 ? "Cancelar" : "Voltar"}
            </Button>
            {wizStep < 3 ? (
              <Button
                size="sm"
                onClick={() => setWizStep((wizStep + 1) as 1 | 2 | 3)}
                disabled={wizStep === 1 ? !newType : (!newTitle.trim() || !newDesc.trim())}
                className="h-8 text-[12px] gap-1"
              >
                Continuar <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button size="sm" onClick={handleNewSubmit} className="h-8 text-[12px] gap-1 bg-primary hover:bg-primary/90">
                <Send className="w-3.5 h-3.5" /> Submeter solicitação
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReviewCell({ label, value, sub, mono }: { label: string; value: string; sub?: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">{label}</p>
      <p className={"text-[12.5px] font-semibold text-foreground leading-tight truncate " + (mono ? "font-mono tabular-nums" : "")}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{sub}</p>}
    </div>
  );
}
