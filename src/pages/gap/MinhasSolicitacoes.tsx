import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Clock, Search, X, Inbox, Send, Plus, GraduationCap, CalendarDays,
  ArrowRight, Check, ChevronLeft, ChevronRight, AlertTriangle, Building2,
  FileText, Paperclip, Trash2, Rocket,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { isInstitutionLive } from "@/pages/financas/_FinHeader";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { categoriaConfig, tipoConfig, type Categoria } from "@/data/gapData";

type Departamento = { id: string; sigla: string; designacao: string; responsavel: string | null };
type MotivoKey = keyof typeof tipoConfig;

export default function GapMinhasSolicitacoes() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("departamentos")
        .select("id, sigla, designacao, responsavel")
        .order("designacao", { ascending: true });
      setDepartamentos((data || []) as Departamento[]);
    })();
  }, []);

  // wizard
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [catSel, setCatSel] = useState<Categoria | null>(null);
  const [motSel, setMotSel] = useState<MotivoKey | null>(null);
  const [destId, setDestId] = useState<string>("");
  const [assunto, setAssunto] = useState("");
  const [justif, setJustif] = useState("");
  const [files, setFiles] = useState<{ name: string; size: string }[]>([]);
  const [search, setSearch] = useState("");

  const motivosDaCat = useMemo(() => {
    if (!catSel) return [] as { key: MotivoKey; label: string; slaDias: number }[];
    return (Object.entries(tipoConfig) as [MotivoKey, typeof tipoConfig[MotivoKey]][])
      .filter(([, v]) => v.categoria === catSel)
      .map(([k, v]) => ({ key: k, label: v.label, slaDias: v.slaDias }));
  }, [catSel]);

  const destSel = departamentos.find(d => d.id === destId) || null;
  const motivoMeta = motSel ? tipoConfig[motSel] : null;

  const reset = () => {
    setStep(1); setCatSel(null); setMotSel(null); setDestId("");
    setAssunto(""); setJustif(""); setFiles([]);
  };
  const openWizard = () => { reset(); setOpen(true); };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const arr = Array.from(list).map(f => ({ name: f.name, size: `${(f.size / 1024).toFixed(0)} KB` }));
    setFiles(prev => [...prev, ...arr]);
  };

  const previewRef = useMemo(() => {
    const seed = Math.floor(Math.random() * 9000) + 1000;
    return `REQ-2025-${seed}`;
  }, [open]);

  const canNext = step === 1 ? !!catSel : step === 2 ? (!!motSel && !!destId && !!assunto.trim() && !!justif.trim()) : true;

  const submit = () => {
    if (!motivoMeta || !destSel) return;
    toast({
      title: "Solicitação submetida",
      description: `${previewRef} · ${motivoMeta.label} → ${destSel.designacao}`,
    });
    setOpen(false);
  };

  // header clock
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  const live = isInstitutionLive(user?.email);
  const liveTime = `${String(now.getHours()).padStart(2,"0")}h:${String(now.getMinutes()).padStart(2,"0")}min:${String(now.getSeconds()).padStart(2,"0")}s`;
  const todayLabel = now.toLocaleDateString("pt-PT", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const ANO_LETIVO = "2024 / 2025";

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
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
                <Rocket className="w-3.5 h-3.5" /> Onboarding
              </span>
            )}
            <div>
              <h1 className="text-xl font-bold text-foreground leading-tight">Minhas Solicitações</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Pedidos institucionais — categoria, motivo, destino.</p>
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

      {/* Empty list */}
      <Card className="overflow-hidden border-border p-0 gap-0">
        <div className="px-5 py-3.5 border-b border-border bg-card flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-[14px] font-semibold text-foreground flex items-center gap-2">
            <Inbox className="w-4 h-4 text-primary" /> Minhas Solicitações
          </h2>
        </div>
        <div className="px-5 py-3 bg-muted/20 flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Procurar…" className="pl-8 h-9 text-xs bg-background border-border" />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="p-12 text-center">
          <Inbox className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">Ainda não submeteu nenhuma solicitação.</p>
          <Button size="sm" onClick={openWizard} className="mt-4 gap-1.5 h-9 text-xs">
            <Plus className="w-4 h-4" /> Nova Solicitação
          </Button>
        </div>
      </Card>

      {/* Wizard */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[640px] p-0 gap-0 overflow-hidden">
          <div className="px-6 pt-5 pb-4 border-b border-border bg-gradient-to-br from-primary/[0.06] via-background to-background">
            <DialogTitle className="text-[15px] font-semibold flex items-center gap-2 leading-tight">
              <Send className="w-4 h-4 text-primary" /> Nova Solicitação
            </DialogTitle>
            <p className="text-[11.5px] text-muted-foreground mt-1">
              {step === 1 && "Escolha a categoria do pedido."}
              {step === 2 && "Escolha o motivo, o destino e descreva o pedido."}
              {step === 3 && "Reveja antes de submeter."}
            </p>
            {/* Stepper */}
            <ol className="mt-4 flex items-center gap-2">
              {([{ n: 1, label: "Categoria" }, { n: 2, label: "Motivo" }, { n: 3, label: "Revisão" }] as const).map((s, i, arr) => {
                const done = step > s.n;
                const active = step === s.n;
                return (
                  <li key={s.n} className="flex items-center gap-2 flex-1">
                    <button
                      type="button"
                      disabled={s.n > step}
                      onClick={() => setStep(s.n as 1|2|3)}
                      className={cn(
                        "flex items-center gap-1.5 text-[11px] font-semibold transition-colors",
                        active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground/60",
                        s.n <= step ? "cursor-pointer" : "cursor-not-allowed"
                      )}
                    >
                      <span className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold tabular-nums shrink-0",
                        active ? "bg-primary text-primary-foreground ring-4 ring-primary/15" :
                        done ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
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

          <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
            {/* STEP 1 — Categoria */}
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {(Object.keys(categoriaConfig) as Categoria[]).map(k => {
                  const m = categoriaConfig[k];
                  const selected = catSel === k;
                  const count = Object.values(tipoConfig).filter(v => v.categoria === k).length;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => { setCatSel(k); setMotSel(null); }}
                      className={cn(
                        "text-left rounded-lg border p-3 transition-all hover:shadow-sm",
                        selected ? "border-primary bg-primary/[0.04] ring-2 ring-primary/15" : "border-border bg-background hover:border-primary/40"
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={cn("w-9 h-9 rounded-md border flex items-center justify-center shrink-0", m.color)}>
                          <m.icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-[13px] font-semibold text-foreground leading-tight">{m.label}</p>
                            {selected && <Check className="w-3.5 h-3.5 text-primary shrink-0" strokeWidth={3} />}
                          </div>
                          <p className="text-[10.5px] text-muted-foreground mt-1">{count} motivos</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* STEP 2 — Motivo + destino + detalhes */}
            {step === 2 && catSel && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-md border border-border bg-muted/30">
                  {(() => { const I = categoriaConfig[catSel].icon; return (
                    <div className={cn("w-7 h-7 rounded-md border flex items-center justify-center shrink-0", categoriaConfig[catSel].color)}>
                      <I className="w-3.5 h-3.5" />
                    </div>
                  ); })()}
                  <p className="text-[12px] font-semibold text-foreground leading-tight flex-1">{categoriaConfig[catSel].label}</p>
                  <button type="button" onClick={() => setStep(1)} className="text-[10.5px] text-primary hover:underline font-medium">Alterar</button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Motivo <span className="text-destructive">*</span></label>
                  <Select value={motSel || ""} onValueChange={(v) => setMotSel(v as MotivoKey)}>
                    <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="Selecionar motivo…" /></SelectTrigger>
                    <SelectContent>
                      {motivosDaCat.map(m => (
                        <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Destino <span className="text-destructive">*</span></label>
                  <Select value={destId} onValueChange={setDestId} disabled={departamentos.length === 0}>
                    <SelectTrigger className="h-9 text-[13px]">
                      <SelectValue placeholder={departamentos.length === 0 ? "Sem departamentos configurados" : "Selecionar departamento…"} />
                    </SelectTrigger>
                    <SelectContent>
                      {departamentos.map(d => (
                        <SelectItem key={d.id} value={d.id}>
                          <span className="font-medium">{d.sigla}</span> · {d.designacao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {departamentos.length === 0 && (
                    <p className="text-[10.5px] text-amber-700">Nenhum departamento registado. Peça à Administração para os criar.</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Assunto <span className="text-destructive">*</span></label>
                  <Input placeholder="Resumo curto do pedido" value={assunto} onChange={e => setAssunto(e.target.value)} className="h-9 text-[13px]" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Justificação <span className="text-destructive">*</span></label>
                  <Textarea rows={4} placeholder="Descreva o motivo do pedido…" value={justif} onChange={e => setJustif(e.target.value)} className="text-[13px] resize-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Anexos</label>
                  <label className="flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/[0.02] transition-colors cursor-pointer py-4 px-4">
                    <Paperclip className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[11.5px] text-muted-foreground"><span className="text-primary font-semibold">Carregar ficheiros</span> · PDF, imagens (máx 10MB)</span>
                    <input type="file" multiple className="sr-only" onChange={e => addFiles(e.target.files)} />
                  </label>
                  {files.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {files.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border bg-background">
                          <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="text-[12px] font-medium text-foreground truncate flex-1">{f.name}</span>
                          <span className="text-[10px] text-muted-foreground tabular-nums">{f.size}</span>
                          <button type="button" onClick={() => setFiles(p => p.filter((_, j) => j !== i))} className="w-5 h-5 rounded inline-flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
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
            {step === 3 && catSel && motivoMeta && destSel && (
              <div className="space-y-3">
                <div className="rounded-lg border border-border bg-background overflow-hidden">
                  <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center gap-2">
                    <Badge variant="outline" className={cn("text-[10px] gap-1 px-2 py-0.5", categoriaConfig[catSel].color)}>
                      {(() => { const I = categoriaConfig[catSel].icon; return <I className="w-2.5 h-2.5" />; })()}
                      {categoriaConfig[catSel].label}
                    </Badge>
                    <span className="text-[10.5px] text-muted-foreground font-mono ml-auto">{previewRef}</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Motivo</p>
                      <p className="text-[13.5px] font-semibold text-foreground leading-tight">{motivoMeta.label}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Assunto</p>
                      <p className="text-[13px] text-foreground leading-tight">{assunto || "—"}</p>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Justificação</p>
                      <p className="text-[12.5px] text-foreground/85 leading-relaxed whitespace-pre-line">{justif || "—"}</p>
                    </div>
                    {files.length > 0 && (
                      <div className="pt-2 border-t border-border">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Anexos</p>
                        <p className="text-[12px] text-foreground">{files.length} ficheiro{files.length === 1 ? "" : "s"}</p>
                      </div>
                    )}
                    <div className="pt-2 border-t border-border grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> Responsável
                        </p>
                        <p className="text-[12.5px] font-semibold text-foreground leading-tight">{destSel.responsavel || "—"}</p>
                        <p className="text-[10.5px] text-muted-foreground mt-0.5">{destSel.sigla} · {destSel.designacao}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Estimativa de conclusão
                        </p>
                        <p className="text-[12.5px] font-semibold text-foreground leading-tight tabular-nums">{motivoMeta.slaDias} dia{motivoMeta.slaDias === 1 ? "" : "s"} úteis</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2 px-3 py-2 rounded-md border border-amber-200 bg-amber-50/50 text-[11px] text-amber-900">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>O pedido será encaminhado para <span className="font-semibold">{destSel.designacao}</span> e ficará pendente.</span>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-3 border-t border-border bg-muted/15 flex items-center justify-between gap-2">
            <Button variant="ghost" size="sm" onClick={() => step === 1 ? setOpen(false) : setStep((step - 1) as 1|2|3)} className="h-8 text-[12px] gap-1">
              {step === 1 ? <X className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              {step === 1 ? "Cancelar" : "Voltar"}
            </Button>
            {step < 3 ? (
              <Button size="sm" onClick={() => setStep((step + 1) as 1|2|3)} disabled={!canNext} className="h-8 text-[12px] gap-1">
                Continuar <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button size="sm" onClick={submit} className="h-8 text-[12px] gap-1">
                <Send className="w-3.5 h-3.5" /> Submeter
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
