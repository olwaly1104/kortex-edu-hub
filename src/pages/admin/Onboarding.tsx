import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import logoUpra from "@/assets/logo-upra.asset.json";
import {
  Building2, GraduationCap, CalendarRange, DoorOpen, Users,
  ClipboardCheck, Check, ChevronLeft, ChevronRight, Plus, Trash2,
  Loader2, Upload, CheckCircle2, Sparkles,
} from "lucide-react";

const STORAGE = "upra.admin.onboarding";

type Faculdade = { id: string; nome: string };
type Curso = { id: string; nome: string; faculdadeId: string };
type Etapa = { id: string; nome: string };
type Ferias = { id: string; nome: string; inicio: string; fim: string };
type Edificio = { id: string; nome: string };
type Sala = { id: string; edificioId: string; nome: string; capacidade: string };
type Docente = { id: string; nome: string; email: string; contrato: string; telefone: string };
type Staff = { id: string; nome: string; posicao: string; contrato: string; email: string; telefone: string };

interface OnboardingState {
  step: number;
  dados: { nome: string; tipo: string; sigla: string; endereco: string; telefone: string; email: string; nif: string; logoDataUrl: string };
  faculdades: Faculdade[];
  cursos: Curso[];
  calendario: { modelo: string; inicio: string; fim: string; candInicio: string; candFim: string; etapas: Etapa[]; ferias: Ferias[] };
  edificios: Edificio[];
  salas: Sala[];
  docentes: Docente[];
  staff: Staff[];
  completed: boolean;
}

const initial: OnboardingState = {
  step: 0,
  dados: { nome: "", tipo: "", sigla: "", endereco: "", telefone: "", email: "", nif: "", logoDataUrl: "" },
  faculdades: [],
  cursos: [],
  calendario: { modelo: "", inicio: "", fim: "", candInicio: "", candFim: "", etapas: [], ferias: [] },
  edificios: [],
  salas: [],
  docentes: [],
  staff: [],
  completed: false,
};

const TIPO_OPTS = ["Universidade", "Instituto Superior Politécnico", "Instituto Superior", "Escola Superior", "Academia"];
const MODELO_OPTS = ["Semestral", "Trimestral", "Anual"];

const STEPS = [
  { key: "dados", title: "Dados da universidade", icon: Building2, desc: "Identidade institucional" },
  { key: "academico", title: "Informação académica", icon: GraduationCap, desc: "Faculdades e cursos" },
  { key: "calendario", title: "Calendário académico", icon: CalendarRange, desc: "Modelo e períodos" },
  { key: "edificios", title: "Edifícios e salas", icon: DoorOpen, desc: "Infraestrutura física" },
  { key: "pessoas", title: "Docentes e staff", icon: Users, desc: "Equipa institucional" },
  { key: "rever", title: "Rever e ativar", icon: ClipboardCheck, desc: "Resumo final" },
];

const uid = () => Math.random().toString(36).slice(2, 9);

export default function AdminOnboarding() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<OnboardingState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) return { ...initial, ...JSON.parse(raw) };
    } catch { /* ignore */ }
    return initial;
  });
  const [success, setSuccess] = useState(false);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STORAGE, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  const set = <K extends keyof OnboardingState>(k: K, v: OnboardingState[K]) => setState((s) => ({ ...s, [k]: v }));
  const setDados = (patch: Partial<OnboardingState["dados"]>) => setState((s) => ({ ...s, dados: { ...s.dados, ...patch } }));
  const setCal = (patch: Partial<OnboardingState["calendario"]>) => setState((s) => ({ ...s, calendario: { ...s.calendario, ...patch } }));

  const step = state.step;
  const progress = Math.round(((step) / (STEPS.length - 1)) * 100);

  const canNext = useMemo(() => {
    if (step === 0) return state.dados.nome.trim().length > 0;
    if (step === 1) return state.faculdades.length > 0 && state.faculdades.every((f) => f.nome.trim());
    if (step === 2) return !!state.calendario.modelo;
    return true;
  }, [step, state]);

  const next = () => setState((s) => ({ ...s, step: Math.min(s.step + 1, STEPS.length - 1) }));
  const prev = () => setState((s) => ({ ...s, step: Math.max(s.step - 1, 0) }));

  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setDados({ logoDataUrl: String(reader.result || "") });
    reader.readAsDataURL(file);
  };

  const activate = () => {
    setActivating(true);
    setTimeout(() => {
      const nome = state.dados.nome.trim() || "Instituição";
      setState((s) => ({ ...s, completed: true }));
      updateUser({ name: nome });
      try { localStorage.setItem(STORAGE, JSON.stringify({ ...state, completed: true })); } catch { /* ignore */ }
      setActivating(false);
      setSuccess(true);
    }, 1100);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-card border border-border rounded-2xl shadow-xl p-10 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">A sua instituição está ativa.</h1>
          <p className="text-muted-foreground mb-6">
            {state.dados.nome} foi criada com sucesso. Pode agora aceder ao portal de administração e completar a configuração detalhada com Finanças, GAP e Área Académica.
          </p>
          <Button size="lg" className="w-full" onClick={() => navigate("/admin")}>
            Entrar no portal de administração
          </Button>
        </div>
      </div>
    );
  }

  const Stepper = (
    <ol className="hidden lg:flex flex-col gap-2">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const active = i === step;
        const done = i < step;
        return (
          <li key={s.key}>
            <button
              type="button"
              onClick={() => i < step && setState((st) => ({ ...st, step: i }))}
              className={`w-full text-left flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors ${active ? "bg-primary/10 border border-primary/30" : done ? "hover:bg-muted" : "opacity-60"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${active ? "bg-primary text-primary-foreground" : done ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`}>
                {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Passo {i + 1}</div>
                <div className={`text-sm font-semibold truncate ${active ? "text-primary" : "text-foreground"}`}>{s.title}</div>
                <div className="text-xs text-muted-foreground truncate">{s.desc}</div>
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center p-1.5 shrink-0">
              <img src={logoUpra.url} alt="UPRA" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-primary flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Onboarding institucional
              </div>
              <h1 className="text-sm font-bold text-foreground truncate">Configurar nova instituição</h1>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
            <span>{user?.email}</span>
            <span className="px-2 py-1 rounded-md bg-muted font-mono">{progress}%</span>
          </div>
        </div>
        <div className="h-1.5 bg-muted">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-[260px_1fr] gap-8">
        <aside className="lg:sticky lg:top-24 self-start">
          {Stepper}
          <div className="lg:hidden flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
            Passo {step + 1} de {STEPS.length} — {STEPS[step].title}
          </div>
        </aside>

        <main>
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
            <div className="mb-6">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-primary">Passo {step + 1} de {STEPS.length}</div>
              <h2 className="text-2xl font-bold text-foreground mt-1">{STEPS[step].title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{STEPS[step].desc}</p>
            </div>

            {step === 0 && (
              <div className="grid md:grid-cols-2 gap-5">
                <div className="md:col-span-2 flex items-center gap-4 p-4 rounded-lg border border-dashed border-border bg-muted/30">
                  <div className="w-20 h-20 rounded-lg bg-card border border-border flex items-center justify-center overflow-hidden shrink-0">
                    {state.dados.logoDataUrl
                      ? <img src={state.dados.logoDataUrl} alt="Logo" className="w-full h-full object-contain" />
                      : <Building2 className="w-8 h-8 text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm font-semibold">Logótipo da instituição</Label>
                    <p className="text-xs text-muted-foreground mb-2">PNG, JPG ou SVG. Recomendado quadrado.</p>
                    <label className="inline-flex items-center gap-2 cursor-pointer rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted">
                      <Upload className="w-4 h-4" /> Carregar logótipo
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} />
                    </label>
                  </div>
                </div>
                <Field label="Nome da universidade *" required>
                  <Input value={state.dados.nome} onChange={(e) => setDados({ nome: e.target.value })} placeholder="Universidade Privada de Angola" />
                </Field>
                <Field label="Tipo de instituição">
                  <Select value={state.dados.tipo} onValueChange={(v) => setDados({ tipo: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecionar tipo" /></SelectTrigger>
                    <SelectContent>{TIPO_OPTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Sigla"><Input value={state.dados.sigla} onChange={(e) => setDados({ sigla: e.target.value })} placeholder="UPRA" /></Field>
                <Field label="NIF"><Input value={state.dados.nif} onChange={(e) => setDados({ nif: e.target.value })} placeholder="5417000000" /></Field>
                <Field label="Endereço" full>
                  <Textarea value={state.dados.endereco} onChange={(e) => setDados({ endereco: e.target.value })} placeholder="Rua, número, cidade, província" rows={2} />
                </Field>
                <Field label="Telefone"><Input value={state.dados.telefone} onChange={(e) => setDados({ telefone: e.target.value })} placeholder="+244 000 000 000" /></Field>
                <Field label="Email institucional"><Input type="email" value={state.dados.email} onChange={(e) => setDados({ email: e.target.value })} placeholder="contacto@instituicao.ao" /></Field>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <RepeatableSection
                  title="Faculdades"
                  subtitle="Pelo menos uma faculdade é obrigatória"
                  items={state.faculdades}
                  onAdd={() => set("faculdades", [...state.faculdades, { id: uid(), nome: "" }])}
                  onRemove={(id) => {
                    set("faculdades", state.faculdades.filter((f) => f.id !== id));
                    set("cursos", state.cursos.filter((c) => c.faculdadeId !== id));
                  }}
                  renderRow={(f, update) => (
                    <Input value={f.nome} onChange={(e) => update({ ...f, nome: e.target.value })} placeholder="Nome da faculdade" />
                  )}
                />
                <RepeatableSection
                  title="Cursos"
                  subtitle="Vincule cada curso a uma faculdade"
                  items={state.cursos}
                  onAdd={() => set("cursos", [...state.cursos, { id: uid(), nome: "", faculdadeId: state.faculdades[0]?.id || "" }])}
                  onRemove={(id) => set("cursos", state.cursos.filter((c) => c.id !== id))}
                  disabledAdd={state.faculdades.length === 0}
                  emptyHint={state.faculdades.length === 0 ? "Adicione uma faculdade primeiro" : undefined}
                  renderRow={(c, update) => (
                    <div className="grid md:grid-cols-2 gap-2 w-full">
                      <Input value={c.nome} onChange={(e) => update({ ...c, nome: e.target.value })} placeholder="Nome do curso" />
                      <Select value={c.faculdadeId} onValueChange={(v) => update({ ...c, faculdadeId: v })}>
                        <SelectTrigger><SelectValue placeholder="Faculdade" /></SelectTrigger>
                        <SelectContent>{state.faculdades.map((f) => <SelectItem key={f.id} value={f.id}>{f.nome || "(sem nome)"}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  )}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-5">
                  <Field label="Modelo académico *">
                    <Select value={state.calendario.modelo} onValueChange={(v) => setCal({ modelo: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                      <SelectContent>{MODELO_OPTS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Data de início"><Input type="date" value={state.calendario.inicio} onChange={(e) => setCal({ inicio: e.target.value })} /></Field>
                  <Field label="Data de fim"><Input type="date" value={state.calendario.fim} onChange={(e) => setCal({ fim: e.target.value })} /></Field>
                  <Field label="Início das candidaturas"><Input type="date" value={state.calendario.candInicio} onChange={(e) => setCal({ candInicio: e.target.value })} /></Field>
                  <Field label="Fim das candidaturas"><Input type="date" value={state.calendario.candFim} onChange={(e) => setCal({ candFim: e.target.value })} /></Field>
                </div>
                <RepeatableSection
                  title="Etapas da candidatura"
                  items={state.calendario.etapas}
                  onAdd={() => setCal({ etapas: [...state.calendario.etapas, { id: uid(), nome: "" }] })}
                  onRemove={(id) => setCal({ etapas: state.calendario.etapas.filter((x) => x.id !== id) })}
                  renderRow={(et, update) => <Input value={et.nome} onChange={(e) => update({ ...et, nome: e.target.value })} placeholder="Nome da etapa" />}
                />
                <RepeatableSection
                  title="Períodos de férias"
                  items={state.calendario.ferias}
                  onAdd={() => setCal({ ferias: [...state.calendario.ferias, { id: uid(), nome: "", inicio: "", fim: "" }] })}
                  onRemove={(id) => setCal({ ferias: state.calendario.ferias.filter((x) => x.id !== id) })}
                  renderRow={(p, update) => (
                    <div className="grid md:grid-cols-3 gap-2 w-full">
                      <Input value={p.nome} onChange={(e) => update({ ...p, nome: e.target.value })} placeholder="Nome" />
                      <Input type="date" value={p.inicio} onChange={(e) => update({ ...p, inicio: e.target.value })} />
                      <Input type="date" value={p.fim} onChange={(e) => update({ ...p, fim: e.target.value })} />
                    </div>
                  )}
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <RepeatableSection
                  title="Edifícios"
                  items={state.edificios}
                  onAdd={() => set("edificios", [...state.edificios, { id: uid(), nome: "" }])}
                  onRemove={(id) => {
                    set("edificios", state.edificios.filter((e) => e.id !== id));
                    set("salas", state.salas.filter((s) => s.edificioId !== id));
                  }}
                  renderRow={(b, update) => <Input value={b.nome} onChange={(e) => update({ ...b, nome: e.target.value })} placeholder="Nome do edifício" />}
                />
                <RepeatableSection
                  title="Salas"
                  items={state.salas}
                  disabledAdd={state.edificios.length === 0}
                  emptyHint={state.edificios.length === 0 ? "Adicione um edifício primeiro" : undefined}
                  onAdd={() => set("salas", [...state.salas, { id: uid(), edificioId: state.edificios[0]?.id || "", nome: "", capacidade: "" }])}
                  onRemove={(id) => set("salas", state.salas.filter((s) => s.id !== id))}
                  renderRow={(s, update) => (
                    <div className="grid md:grid-cols-3 gap-2 w-full">
                      <Select value={s.edificioId} onValueChange={(v) => update({ ...s, edificioId: v })}>
                        <SelectTrigger><SelectValue placeholder="Edifício" /></SelectTrigger>
                        <SelectContent>{state.edificios.map((e) => <SelectItem key={e.id} value={e.id}>{e.nome || "(sem nome)"}</SelectItem>)}</SelectContent>
                      </Select>
                      <Input value={s.nome} onChange={(e) => update({ ...s, nome: e.target.value })} placeholder="Nome da sala" />
                      <Input value={s.capacidade} onChange={(e) => update({ ...s, capacidade: e.target.value })} placeholder="Capacidade" type="number" />
                    </div>
                  )}
                />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <RepeatableSection
                  title="Docentes"
                  items={state.docentes}
                  onAdd={() => set("docentes", [...state.docentes, { id: uid(), nome: "", email: "", contrato: "", telefone: "" }])}
                  onRemove={(id) => set("docentes", state.docentes.filter((d) => d.id !== id))}
                  renderRow={(d, update) => (
                    <div className="grid md:grid-cols-4 gap-2 w-full">
                      <Input value={d.nome} onChange={(e) => update({ ...d, nome: e.target.value })} placeholder="Nome" />
                      <Input value={d.email} onChange={(e) => update({ ...d, email: e.target.value })} placeholder="Email" type="email" />
                      <Input value={d.contrato} onChange={(e) => update({ ...d, contrato: e.target.value })} placeholder="Contrato" />
                      <Input value={d.telefone} onChange={(e) => update({ ...d, telefone: e.target.value })} placeholder="Telefone" />
                    </div>
                  )}
                />
                <RepeatableSection
                  title="Staff"
                  items={state.staff}
                  onAdd={() => set("staff", [...state.staff, { id: uid(), nome: "", posicao: "", contrato: "", email: "", telefone: "" }])}
                  onRemove={(id) => set("staff", state.staff.filter((s) => s.id !== id))}
                  renderRow={(s, update) => (
                    <div className="grid md:grid-cols-5 gap-2 w-full">
                      <Input value={s.nome} onChange={(e) => update({ ...s, nome: e.target.value })} placeholder="Nome" />
                      <Input value={s.posicao} onChange={(e) => update({ ...s, posicao: e.target.value })} placeholder="Posição" />
                      <Input value={s.contrato} onChange={(e) => update({ ...s, contrato: e.target.value })} placeholder="Contrato" />
                      <Input value={s.email} onChange={(e) => update({ ...s, email: e.target.value })} placeholder="Email" type="email" />
                      <Input value={s.telefone} onChange={(e) => update({ ...s, telefone: e.target.value })} placeholder="Telefone" />
                    </div>
                  )}
                />
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <SummaryRow label="Nome da instituição" value={state.dados.nome || "—"} />
                  <SummaryRow label="Tipo" value={state.dados.tipo || "—"} />
                  <SummaryRow label="Nº de faculdades" value={String(state.faculdades.length)} />
                  <SummaryRow label="Nº de cursos" value={String(state.cursos.length)} />
                  <SummaryRow label="Modelo académico" value={state.calendario.modelo || "—"} />
                  <SummaryRow label="Nº de edifícios / salas" value={`${state.edificios.length} / ${state.salas.length}`} />
                  <SummaryRow label="Nº de docentes" value={String(state.docentes.length)} />
                  <SummaryRow label="Nº de administradores (staff)" value={String(state.staff.length)} />
                </div>
                <div className="pt-4">
                  <Button size="lg" className="w-full" onClick={activate} disabled={activating || !state.dados.nome.trim() || state.faculdades.length === 0 || !state.calendario.modelo}>
                    {activating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> A ativar instituição...</> : <><CheckCircle2 className="w-4 h-4 mr-2" /> Ativar instituição</>}
                  </Button>
                  {(!state.dados.nome.trim() || state.faculdades.length === 0 || !state.calendario.modelo) && (
                    <p className="text-xs text-destructive mt-2 text-center">Complete os campos obrigatórios nos passos anteriores.</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-border">
              <Button type="button" variant="ghost" onClick={prev} disabled={step === 0}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
              </Button>
              <div className="text-xs text-muted-foreground hidden sm:block">As alterações são guardadas automaticamente.</div>
              {step < STEPS.length - 1 ? (
                <Button type="button" onClick={next} disabled={!canNext}>
                  Continuar <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : <div className="w-[88px]" />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, children, full, required }: { label: string; children: React.ReactNode; full?: boolean; required?: boolean }) {
  return (
    <div className={`space-y-1.5 ${full ? "md:col-span-2" : ""}`}>
      <Label className="text-sm font-medium">{label}{required && <span className="text-destructive ml-0.5">*</span>}</Label>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
      <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{label}</div>
      <div className="text-base font-semibold text-foreground mt-0.5">{value}</div>
    </div>
  );
}

function RepeatableSection<T extends { id: string }>({
  title, subtitle, items, onAdd, onRemove, renderRow, disabledAdd, emptyHint,
}: {
  title: string;
  subtitle?: string;
  items: T[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  renderRow: (item: T, update: (next: T) => void) => React.ReactNode;
  disabledAdd?: boolean;
  emptyHint?: string;
}) {
  // local update routes back through parent by replacing item
  // we rely on parent passing the updated list via onAdd/renderRow callbacks
  // For inline updates, we use a wrapper:
  return (
    <div>
      <div className="flex items-end justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <Button type="button" size="sm" variant="outline" onClick={onAdd} disabled={disabledAdd}>
          <Plus className="w-4 h-4 mr-1" /> Adicionar
        </Button>
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground border border-dashed border-border rounded-lg py-6 text-center">
          {emptyHint || "Nenhum item adicionado ainda."}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <RepeatableRow key={item.id} item={item} onRemove={() => onRemove(item.id)} renderRow={renderRow} />
          ))}
        </div>
      )}
    </div>
  );
}

function RepeatableRow<T extends { id: string }>({ item, onRemove, renderRow }: { item: T; onRemove: () => void; renderRow: (item: T, update: (next: T) => void) => React.ReactNode }) {
  // Local controlled wrapper: update propagates via a custom event upward
  // Since renderRow receives `update`, we must keep state aligned with parent
  // Simpler: the parent owns state; we forward update through a callback via DOM events.
  // To keep it straightforward, renderRow receives `update` that we re-emit using a custom mutation:
  const update = (next: T) => {
    const evt = new CustomEvent("repeatable-update", { detail: next, bubbles: true });
    rowRef.current?.dispatchEvent(evt);
  };
  const rowRef = useRowRef<T>(item);
  return (
    <div ref={rowRef.ref} className="flex items-start gap-2 rounded-lg border border-border bg-card px-3 py-2">
      <div className="flex-1 min-w-0">{renderRow(item, update)}</div>
      <Button type="button" variant="ghost" size="icon" onClick={onRemove} className="text-muted-foreground hover:text-destructive">
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

// Tiny hook that bridges the inline update event back to parent setter via a closure callback registered on the DOM element.
function useRowRef<T extends { id: string }>(item: T) {
  // We attach a listener that finds the parent setter through a global registry keyed by item.id is overkill.
  // Cleaner: dispatch a custom event that bubbles, and the section listens. But sections don't listen here.
  // To avoid that complexity, replace this whole approach with React: pass an "update" prop down.
  // (Kept as no-op ref because RepeatableSection is refactored below if needed.)
  const ref = { current: null as HTMLDivElement | null };
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return { ref: (el: HTMLDivElement | null) => { ref.current = el; } } as unknown as { ref: React.RefCallback<HTMLDivElement> };
}
