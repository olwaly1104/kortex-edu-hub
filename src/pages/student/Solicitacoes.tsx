import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  HelpCircle, Plus, Search, X, Inbox, Clock, CheckCircle2, AlertCircle, Send, ChevronRight, ChevronLeft, Eye,
  Building2, Timer, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  solicitacoes as gapSolicitacoes, Solicitacao, EstadoSolicitacao,
  estadoSolicitacaoConfig, destinoConfig, tipoConfig, categoriaConfig, Categoria,
} from "@/data/gapData";
import SolicitacaoDocPreview from "@/pages/gap/SolicitacaoDocPreview";

const STUDENT_MATRICULA = "2024001"; // Ana Luísa Ferreira (logged in)
const TODAY = "2025-12-16";

const estadoDot: Record<EstadoSolicitacao, string> = {
  recebida: "bg-amber-500",
  em_execucao: "bg-sky-500",
  concluida: "bg-emerald-500",
  rejeitada: "bg-destructive",
  em_atraso: "bg-orange-500",
};

const CATEGORIA_HINT: Record<Categoria, string> = {
  Tecnológico: "Portal, email, cartão de discente, sistemas.",
  Académico:   "Inscrições, declarações, certificados, notas.",
  Financeiro:  "Pagamentos, propinas, multas, bolsas.",
};

type EstadoFilter = "todos" | "pendentes" | "em_execucao" | "concluidas" | "rejeitadas";

export default function StudentSolicitacoes() {
  const { toast } = useToast();
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [extras, setExtras] = useState<Solicitacao[]>([]);
  const [estado, setEstado] = useState<EstadoFilter>("todos");
  const [search, setSearch] = useState("");

  const own = useMemo(() => {
    const baseline = gapSolicitacoes.filter(s => s.matricula === STUDENT_MATRICULA);
    return [...extras, ...baseline].sort((a, b) => b.dataSubmissao.localeCompare(a.dataSubmissao));
  }, [extras]);

  const counts = useMemo(() => ({
    todos: own.length,
    pendentes: own.filter(s => s.estado === "recebida").length,
    em_execucao: own.filter(s => s.estado === "em_execucao").length,
    concluidas: own.filter(s => s.estado === "concluida").length,
    rejeitadas: own.filter(s => s.estado === "rejeitada").length,
  }), [own]);

  const filtered = useMemo(() => {
    return own.filter(s => {
      if (estado === "pendentes" && s.estado !== "recebida") return false;
      if (estado === "em_execucao" && s.estado !== "em_execucao") return false;
      if (estado === "concluidas" && s.estado !== "concluida") return false;
      if (estado === "rejeitadas" && s.estado !== "rejeitada") return false;
      if (search) {
        const q = search.toLowerCase();
        const tipoLabel = tipoConfig[s.tipo]?.label.toLowerCase() ?? "";
        if (!s.assunto.toLowerCase().includes(q) && !tipoLabel.includes(q) && !s.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [own, estado, search]);

  const fmt = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const tabs: { key: EstadoFilter; label: string; icon: typeof Inbox; count: number }[] = [
    { key: "todos",       label: "Todas",       icon: Inbox,         count: counts.todos },
    { key: "pendentes",   label: "Pendentes",   icon: Clock,         count: counts.pendentes },
    { key: "em_execucao", label: "Em Execução", icon: Send,          count: counts.em_execucao },
    { key: "concluidas",  label: "Concluídas",  icon: CheckCircle2,  count: counts.concluidas },
    { key: "rejeitadas",  label: "Rejeitadas",  icon: AlertCircle,   count: counts.rejeitadas },
  ];

  const onCreate = (nova: Solicitacao) => {
    setExtras(prev => [nova, ...prev]);
    toast({
      title: "Solicitação submetida",
      description: `${nova.id} encaminhada para ${destinoConfig[nova.destino].label}.`,
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-primary" /> Solicitações
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Submeta pedidos académicos, financeiros e tecnológicos ao Gabinete de Apoio ao Discente.
          </p>
        </div>
        <NovaSolicitacaoDialog onCreate={onCreate} totalCount={extras.length} />
      </div>

      {/* KPI tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = estado === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setEstado(t.key)}
              className={cn(
                "flex items-center justify-between gap-3 px-4 py-3 rounded-lg border bg-background transition-colors text-left",
                active ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={cn("w-4 h-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-xs font-semibold truncate", active ? "text-primary" : "text-foreground")}>{t.label}</span>
              </div>
              <span className={cn("text-base font-bold tabular-nums", active ? "text-primary" : "text-foreground")}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Procurar por assunto, motivo ou referência…"
            className="pl-9 h-9 text-sm"
          />
        </div>
        {(search || estado !== "todos") && (
          <Button size="sm" variant="ghost" onClick={() => { setSearch(""); setEstado("todos"); }} className="gap-1.5 text-xs">
            <X className="w-3.5 h-3.5" /> Limpar
          </Button>
        )}
      </div>

      {/* Lista */}
      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              {own.length === 0
                ? "Ainda não submeteu nenhuma solicitação."
                : "Nenhuma solicitação corresponde aos filtros."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(s => {
              const st = estadoSolicitacaoConfig[s.estado];
              const tipoCfg = tipoConfig[s.tipo];
              const catCfg = tipoCfg ? categoriaConfig[tipoCfg.categoria] : undefined;
              const destCfg = destinoConfig[s.destino];
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setPreviewId(s.id)}
                  className="w-full text-left px-5 py-4 hover:bg-muted/40 transition-colors flex items-start gap-4"
                >
                  <span className={cn("w-2 h-2 rounded-full mt-2 shrink-0", estadoDot[s.estado])} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-[11px] text-muted-foreground">{s.id}</span>
                      {catCfg && (
                        <Badge variant="outline" className={cn("text-[10px] py-0 h-4 border", catCfg.color)}>
                          {catCfg.label}
                        </Badge>
                      )}
                      <Badge variant="outline" className={cn("text-[10px] py-0 h-4 border", destCfg.color)}>
                        {destCfg.label}
                      </Badge>
                    </div>
                    <p className="text-[14px] font-semibold text-foreground leading-snug truncate">{s.assunto}</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5 truncate">
                      {tipoCfg?.label ?? s.tipo}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant="outline" className={cn("text-[10px] py-0 h-5 border", st.color)}>
                      {st.label}
                    </Badge>
                    <p className="text-[11px] text-muted-foreground mt-1 tabular-nums">{fmt(s.dataSubmissao)}</p>
                  </div>
                  <Eye className="w-4 h-4 text-muted-foreground/50 mt-2 shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {/* Document preview dialog */}
      <Dialog open={!!previewId} onOpenChange={(v) => { if (!v) setPreviewId(null); }}>
        <DialogContent className="max-w-5xl w-[95vw] h-[92vh] p-0 gap-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Documento Pedido-{previewId}</DialogTitle>
            <DialogDescription>Pré-visualização do documento institucional gerado.</DialogDescription>
          </DialogHeader>
          {previewId && (() => {
            const s = own.find(x => x.id === previewId);
            if (!s) return null;
            const anexos = (s.anexos ?? []).map(a => ({ nome: a.nome, tamanho: "—" }));
            return <SolicitacaoDocPreview solicitacao={s} anexos={anexos} />;
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ───────────────── Nova Solicitação Dialog (wizard) ───────────────── */

function NovaSolicitacaoDialog({ onCreate, totalCount }: { onCreate: (s: Solicitacao) => void; totalCount: number }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [tipo, setTipo] = useState<string>("");
  const [tipoQuery, setTipoQuery] = useState("");
  const [assunto, setAssunto] = useState("");
  const [descricao, setDescricao] = useState("");

  const reset = () => {
    setStep(1);
    setCategoria(null); setTipo(""); setTipoQuery("");
    setAssunto(""); setDescricao("");
  };

  const onOpenChange = (o: boolean) => {
    setOpen(o);
    if (!o) setTimeout(reset, 200);
  };

  const tiposDaCategoria = useMemo(() => {
    if (!categoria) return [];
    const list = Object.entries(tipoConfig)
      .filter(([, cfg]) => cfg.categoria === categoria)
      .map(([key, cfg]) => ({ key, ...cfg }))
      .sort((a, b) => a.label.localeCompare(b.label));
    if (!tipoQuery.trim()) return list;
    const q = tipoQuery.toLowerCase();
    return list.filter(t => t.label.toLowerCase().includes(q));
  }, [categoria, tipoQuery]);

  const tipoCfg = tipo ? tipoConfig[tipo] : null;

  const stepValid: Record<number, boolean> = {
    1: !!categoria,
    2: !!tipo,
    3: assunto.trim().length > 2,
    4: descricao.trim().length > 5,
  };
  const canConfirm = stepValid[1] && stepValid[2] && stepValid[3] && stepValid[4];

  const STEPS = [
    { n: 1, label: "Categoria" },
    { n: 2, label: "Motivo" },
    { n: 3, label: "Assunto" },
    { n: 4, label: "Descrição" },
  ] as const;

  const goNext = () => setStep(s => (s < 4 ? ((s + 1) as typeof s) : s));
  const goPrev = () => setStep(s => (s > 1 ? ((s - 1) as typeof s) : s));

  const submit = () => {
    if (!canConfirm || !tipoCfg) return;
    const id = `SOL-2025-${String(9000 + totalCount + 1).padStart(4, "0")}`;
    const nova: Solicitacao = {
      id,
      discente: "Ana Luísa Ferreira",
      matricula: STUDENT_MATRICULA,
      curso: "Eng. Informática",
      faculdade: "Faculdade de Ciências Exatas",
      ano: 2,
      tipo,
      assunto: assunto.trim(),
      descricao: descricao.trim(),
      destino: tipoCfg.destino,
      estado: "recebida",
      prioridade: "media",
      slaDias: tipoCfg.slaDias,
      dataSubmissao: TODAY,
      historico: [
        { data: `${TODAY} 08:00`, actor: "Portal do Discente", accao: "Solicitação submetida pelo discente" },
        { data: `${TODAY} 08:01`, actor: "Sistema", accao: `Encaminhada automaticamente para ${destinoConfig[tipoCfg.destino].label}` },
      ],
    };
    onCreate(nova);
    setOpen(false);
    setTimeout(reset, 200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Nova Solicitação</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl border-border">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-border bg-card">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-semibold leading-tight">Nova Solicitação</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Passo {step} de {STEPS.length} — {STEPS[step - 1].label}
              </p>
            </div>
          </div>

          {/* Numbered stepper */}
          <div className="mt-4 flex items-center gap-1 overflow-x-auto">
            {STEPS.map((s, i) => {
              const isActive = step === s.n;
              const isDone = step > s.n;
              const reachable = isDone || isActive || (s.n > 1 && stepValid[s.n - 1]);
              return (
                <div key={s.n} className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => { if (reachable) setStep(s.n as typeof step); }}
                    className={cn(
                      "flex items-center gap-1.5 h-7 pl-1 pr-2 rounded-full border transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : isDone
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                    )}
                  >
                    <span className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                      isActive ? "bg-primary-foreground/20" : isDone ? "bg-emerald-200/70" : "bg-background"
                    )}>
                      {isDone ? <CheckCircle2 className="w-3 h-3" /> : s.n}
                    </span>
                    <span className="text-[10px] font-semibold whitespace-nowrap hidden sm:inline">
                      {s.label}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && <div className="w-3 h-px bg-border" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 min-h-[340px] max-h-[60vh] overflow-y-auto">

          {/* STEP 1 — Categoria */}
          {step === 1 && (
            <FieldBlock n={1} title="Categoria do pedido">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {(Object.keys(categoriaConfig) as Categoria[]).map(c => {
                  const cfg = categoriaConfig[c];
                  const Icon = cfg.icon;
                  const active = categoria === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { setCategoria(c); setTipo(""); setTipoQuery(""); }}
                      className={cn(
                        "flex flex-col items-start gap-2 p-3.5 rounded-lg border text-left transition-all",
                        active
                          ? "border-primary bg-primary/5 ring-2 ring-primary/15"
                          : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
                      )}
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center",
                        active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{cfg.label}</p>
                        <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                          {CATEGORIA_HINT[c]}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </FieldBlock>
          )}

          {/* STEP 2 — Motivo */}
          {step === 2 && categoria && (
            <FieldBlock n={2} title={`Motivo do pedido — ${categoriaConfig[categoria].label}`}>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  autoFocus
                  placeholder="Procurar motivo…"
                  value={tipoQuery}
                  onChange={e => setTipoQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <div className="grid grid-cols-1 gap-1.5 max-h-[300px] overflow-y-auto pr-0.5">
                {tiposDaCategoria.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-4 text-center">Nenhum motivo encontrado.</p>
                ) : tiposDaCategoria.map(t => {
                  const active = tipo === t.key;
                  const destCfg = destinoConfig[t.destino];
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTipo(t.key)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-md border text-left transition-all",
                        active
                          ? "border-primary bg-primary/5 ring-2 ring-primary/15"
                          : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-foreground leading-snug">{t.label}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Building2 className="w-2.5 h-2.5" /> {destCfg.label}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Timer className="w-2.5 h-2.5" /> Prazo {t.slaDias} dia{t.slaDias > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      {active && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </FieldBlock>
          )}

          {/* STEP 3 — Assunto */}
          {step === 3 && (
            <FieldBlock n={3} title="Assunto">
              <Input
                autoFocus
                placeholder="Resumo curto e claro do pedido"
                value={assunto}
                onChange={e => setAssunto(e.target.value)}
                maxLength={120}
                className="h-10 text-sm"
              />
              <p className="text-[10px] text-muted-foreground mt-2">
                {assunto.length}/120 caracteres.
              </p>
            </FieldBlock>
          )}

          {/* STEP 4 — Descrição + Resumo */}
          {step === 4 && tipoCfg && (
            <FieldBlock n={4} title="Descrição detalhada">
              <Textarea
                autoFocus
                placeholder="Descreva o pedido com o máximo de detalhe possível, incluindo datas, referências e contexto."
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                rows={6}
                className="resize-none text-sm"
              />

              {/* Resumo final */}
              <div className="mt-4 rounded-lg border border-border bg-muted/20 p-3.5 space-y-1.5 text-[11.5px]">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3 h-3" /> Resumo da solicitação
                </p>
                <p><span className="text-muted-foreground">Categoria:</span> <strong>{categoria}</strong></p>
                <p><span className="text-muted-foreground">Motivo:</span> <strong>{tipoCfg.label}</strong></p>
                <p><span className="text-muted-foreground">Assunto:</span> <strong>{assunto || "—"}</strong></p>
                <p><span className="text-muted-foreground">Encaminhamento:</span> <strong>{destinoConfig[tipoCfg.destino].label}</strong> · prazo SLA <strong>{tipoCfg.slaDias} dia{tipoCfg.slaDias > 1 ? "s" : ""}</strong></p>
              </div>
            </FieldBlock>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20 flex-row items-center justify-between gap-3 sm:justify-between">
          <div className="text-[11px] text-muted-foreground tabular-nums">
            Passo <strong className="text-foreground">{step}</strong> de {STEPS.length}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <DialogClose asChild>
              <Button variant="outline" size="sm">Cancelar</Button>
            </DialogClose>
            {step > 1 && (
              <Button variant="ghost" size="sm" onClick={goPrev} className="gap-1">
                <ChevronLeft className="w-4 h-4" /> Voltar
              </Button>
            )}
            {step < 4 ? (
              <Button
                size="sm"
                disabled={!stepValid[step]}
                onClick={goNext}
                className="gap-1.5"
              >
                Continuar <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button size="sm" disabled={!canConfirm} onClick={submit} className="gap-1.5">
                <Send className="w-4 h-4" /> Submeter
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FieldBlock({ n, title, optional, children }: { n: number; title: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold">{n}</span>
        <Label className="text-[11px] uppercase tracking-wider text-foreground font-semibold">
          {title}
          {optional && <span className="ml-1.5 normal-case tracking-normal text-muted-foreground font-normal">(opcional)</span>}
        </Label>
      </div>
      {children}
    </section>
  );
}
