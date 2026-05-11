import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { inscricoesRecent } from "@/data/inscricoesData";
import {
  User, MapPin, ShieldCheck, GraduationCap, BookOpen, FileText,
  Upload, CheckCircle2, Send, Plus, ArrowLeft, ArrowRight,
  Users, CalendarDays, Clock, TrendingUp, Search, X, Check, ChevronRight,
} from "lucide-react";

/* ─────────────────────────── data ─────────────────────────── */

const FACULDADES: Record<string, string[]> = {
  "Faculdade de Ciências Exatas": ["Arquitectura", "Engenharia Informática", "Engenharia Civil"],
  "Faculdade de Ciências Sociais": ["Direito", "Economia", "Gestão"],
  "Faculdade de Saúde": ["Medicina", "Enfermagem"],
};
const PROVINCIAS = ["Luanda", "Benguela", "Huíla", "Huambo", "Cabinda", "Cuanza Sul", "Malanje", "Uíge"];
const SESSOES = ["1ª Sessão", "2ª Sessão", "3ª Sessão"];
const PARENTESCO = ["Pai", "Mãe", "Tutor(a)", "Avô/Avó", "Outro"];
const DOCS = [
  { key: "bi", label: "Bilhete de Identidade" },
  { key: "notas", label: "Declaração de Notas" },
  { key: "certidao", label: "Certidão de Habilitações" },
  { key: "foto", label: "Foto tipo passe" },
  { key: "pagamento", label: "Comprovativo de Pagamento" },
];

interface FormState {
  nome: string; bi: string; nascimento: string; genero: string; naturalidade: string; nacionalidade: string;
  email: string; telemovel: string; provincia: string; municipio: string; endereco: string;
  encNome: string; encBi: string; encParentesco: string; encTelefone: string; encEmail: string;
  escola: string; tipoEnsino: string; anoConclusao: string; mediaFinal: string;
  faculdade: string; curso1: string; curso2: string; sessao: string;
  confirmar: boolean;
}

const empty: FormState = {
  nome: "", bi: "", nascimento: "", genero: "", naturalidade: "", nacionalidade: "Angolana",
  email: "", telemovel: "", provincia: "", municipio: "", endereco: "",
  encNome: "", encBi: "", encParentesco: "", encTelefone: "", encEmail: "",
  escola: "", tipoEnsino: "", anoConclusao: "", mediaFinal: "",
  faculdade: "", curso1: "", curso2: "", sessao: "",
  confirmar: false,
};

const STEPS = [
  { n: 1, key: "pessoais",     title: "Dados Pessoais",         icon: User },
  { n: 2, key: "contactos",    title: "Contactos & Morada",     icon: MapPin },
  { n: 3, key: "encarregado",  title: "Encarregado",            icon: ShieldCheck },
  { n: 4, key: "academica",    title: "Formação Académica",     icon: GraduationCap },
  { n: 5, key: "curso",        title: "Curso & Sessão",         icon: BookOpen },
  { n: 6, key: "documentos",   title: "Documentos",             icon: FileText },
  { n: 7, key: "revisao",      title: "Revisão & Submissão",    icon: Check },
] as const;

const STEP_FIELDS: Record<number, (keyof FormState)[]> = {
  1: ["nome","bi","nascimento","genero","naturalidade"],
  2: ["email","telemovel","provincia","municipio"],
  3: ["encNome","encBi","encParentesco","encTelefone"],
  4: ["escola","tipoEnsino","anoConclusao","mediaFinal"],
  5: ["faculdade","curso1","sessao"],
  6: [],
  7: [],
};

/* mock recent candidaturas (sourced from shared module) */
const RECENT_SEED = inscricoesRecent.map(r => ({
  ref: r.ref, nome: r.nome, curso: r.curso, sessao: r.sessao, data: r.data, estado: r.estado, notaSessao: r.notaSessao,
  docsEntregues: r.documentos.filter(d => d.entregue).length,
  docsTotal: r.documentos.length,
  preparatorio: r.preparatorio,
}));


/* ─────────────────────────── helpers ─────────────────────────── */

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12px] font-medium text-foreground">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

/* ─────────────────────────── component ─────────────────────────── */

export default function InscricoesRegistar() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [view, setView] = useState<"dashboard" | "wizard">("dashboard");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(empty);
  const [docs, setDocs] = useState<Record<string, string | null>>({});
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [recent, setRecent] = useState(RECENT_SEED);
  const [search, setSearch] = useState("");
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors.has(k as string)) {
      const n = new Set(errors); n.delete(k as string); setErrors(n);
    }
  };

  const cursos = form.faculdade ? FACULDADES[form.faculdade] || [] : [];
  const inputCls = (k: string) => cn(errors.has(k) && "border-destructive focus-visible:ring-destructive");

  const validateStep = (s: number) => {
    const need = STEP_FIELDS[s];
    const missing = new Set<string>();
    need.forEach(k => { if (!String(form[k]).trim()) missing.add(k as string); });
    return missing;
  };

  const next = () => {
    const m = validateStep(step);
    if (m.size) {
      setErrors(m);
      toast({ title: "Campos em falta", description: "Preencha os campos obrigatórios para continuar.", variant: "destructive" });
      return;
    }
    setErrors(new Set());
    setStep(s => Math.min(STEPS.length, s + 1));
  };
  const prev = () => { setErrors(new Set()); setStep(s => Math.max(1, s - 1)); };

  const startNew = () => {
    setForm(empty); setDocs({}); setErrors(new Set()); setStep(1); setView("wizard");
  };
  const cancel = () => {
    setForm(empty); setDocs({}); setErrors(new Set()); setStep(1); setView("dashboard");
  };

  const submit = () => {
    if (!form.confirmar) {
      setErrors(new Set(["confirmar"]));
      toast({ title: "Confirmação necessária", description: "Confirme a veracidade dos dados.", variant: "destructive" });
      return;
    }
    const ref = `CAND-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const now = new Date();
    const data = `${now.toISOString().slice(0,10)} ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    setRecent(r => [{ ref, nome: form.nome, curso: form.curso1, sessao: form.sessao, data, estado: "Submetida", notaSessao: undefined, docsEntregues: Object.values(docs).filter(Boolean).length, docsTotal: DOCS.length, preparatorio: false }, ...r]);
    toast({ title: "Candidatura criada", description: `${ref} — ${form.nome} registado(a) com sucesso.` });
    setForm(empty); setDocs({}); setErrors(new Set()); setStep(1); setView("dashboard");
  };

  /* ───── KPI calcs ───── */
  const kpis = useMemo(() => {
    const today = new Date().toISOString().slice(0,10);
    const hoje = recent.filter(r => r.data.startsWith(today)).length;
    const sessao1 = recent.filter(r => r.sessao === "1ª Sessão").length;
    return { total: recent.length, hoje, sessao1 };
  }, [recent]);

  const filteredRecent = recent.filter(r =>
    !search.trim() || r.nome.toLowerCase().includes(search.toLowerCase()) || r.ref.toLowerCase().includes(search.toLowerCase())
  );

  /* ─────────────────────────── DASHBOARD ─────────────────────────── */
  if (view === "dashboard") {
    return (
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Portal de Inscrições</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Registo de novos candidatos · Ano lectivo 2026 / 2027
            </p>
          </div>
          <Button onClick={startNew} className="gap-2 h-10">
            <Plus className="w-4 h-4" /> Criar Inscrição
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={CalendarDays} label="Data de hoje"     value={new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })} tone="emerald" />
          <KpiCard icon={CalendarDays} label="Inscrições hoje"  value={kpis.hoje}    tone="blue" />
          <KpiCard icon={Users}        label="Total candidatos" value={kpis.total}   tone="primary" />
          <KpiCard icon={Clock}        label="Sessão activa"    value="1ª"           tone="amber" suffix="Sessão" />
        </div>

        {/* Recent table */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Inscrições recentes</h2>
              <p className="text-[12px] text-muted-foreground">Últimas candidaturas submetidas pelo balcão</p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Pesquisar por nome ou referência…"
                className="h-9 pl-8 text-[13px]"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">Referência</th>
                  <th className="text-left px-4 py-2.5 font-medium">Candidato</th>
                  <th className="text-left px-4 py-2.5 font-medium">Curso (1ª opção)</th>
                  <th className="text-left px-4 py-2.5 font-medium">Sessão</th>
                  <th className="text-left px-4 py-2.5 font-medium">Submetida em</th>
                  <th className="text-left px-4 py-2.5 font-medium">Docs</th>
                  <th className="text-left px-4 py-2.5 font-medium">Preparatório</th>
                  <th className="text-left px-4 py-2.5 font-medium">Nota</th>
                  <th className="text-left px-4 py-2.5 font-medium">Estado</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {filteredRecent.map(r => {
                  const estadoCls =
                    r.estado === "Aprovada"  ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    r.estado === "Reprovada" ? "bg-red-50 text-red-700 border-red-200" :
                    r.estado === "Em análise"? "bg-amber-50 text-amber-700 border-amber-200" :
                                               "bg-blue-50 text-blue-700 border-blue-200";
                  return (
                    <tr
                      key={r.ref}
                      onClick={() => navigate(`/inscricoes/candidato/${r.ref}`)}
                      className="border-t hover:bg-muted/40 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-2.5 font-mono text-[12px] text-foreground">{r.ref}</td>
                      <td className="px-4 py-2.5 font-medium text-foreground">{r.nome}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{r.curso}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{r.sessao}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{r.data}</td>
                      <td className="px-4 py-2.5 tabular-nums text-muted-foreground">
                        <span className={cn("font-medium", r.docsEntregues === r.docsTotal ? "text-emerald-700" : "text-amber-700")}>
                          {r.docsEntregues}/{r.docsTotal}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className={cn("text-[11px]", r.preparatorio
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-muted text-muted-foreground border-border")}>
                          {r.preparatorio ? "Sim" : "Não"}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 tabular-nums">
                        {typeof r.notaSessao === "number"
                          ? <span className={cn(
                              "font-semibold",
                              r.notaSessao >= 10 ? "text-emerald-700" : "text-red-700"
                            )}>{r.notaSessao.toFixed(1)}</span>
                          : <span className="text-muted-foreground/60">—</span>}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className={cn("text-[11px]", estadoCls)}>
                          {r.estado}
                        </Badge>
                      </td>
                      <td className="px-2 text-muted-foreground"><ChevronRight className="w-4 h-4" /></td>
                    </tr>
                  );
                })}
                {!filteredRecent.length && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground text-[13px]">Sem resultados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  /* ─────────────────────────── WIZARD ─────────────────────────── */
  const current = STEPS[step - 1];

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <button onClick={cancel} className="text-[12px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3 h-3" /> Voltar ao painel
          </button>
          <h1 className="text-xl font-bold text-foreground">Nova Inscrição</h1>
          <p className="text-[13px] text-muted-foreground">Passo {step} de {STEPS.length} · {current.title}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={cancel} className="h-8 text-[12px] gap-1.5">
          <X className="w-3.5 h-3.5" /> Cancelar
        </Button>
      </div>

      {/* Stepper */}
      <Card className="p-5">
        <div className="flex items-center justify-between gap-1 overflow-x-auto">
          {STEPS.map((s, i) => {
            const done = step > s.n;
            const active = step === s.n;
            return (
              <div key={s.key} className="flex items-center flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => { setErrors(new Set()); setStep(s.n); }}
                  className={cn(
                    "flex flex-col items-center gap-1.5 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold border-2 transition-colors",
                    done && "bg-primary border-primary text-primary-foreground",
                    active && "bg-primary/10 border-primary text-primary",
                    !done && !active && "bg-background border-border text-muted-foreground"
                  )}>
                    {done ? <Check className="w-4 h-4" /> : s.n}
                  </div>
                  <span className={cn(
                    "text-[10.5px] font-medium text-center max-w-[88px] leading-tight hidden md:block",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}>{s.title}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={cn("h-0.5 flex-1 mx-1 md:mx-2 rounded-full", step > s.n ? "bg-primary" : "bg-border")} />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Step content */}
      <Card className="p-6">
        <div className="flex items-center gap-2 pb-4 mb-5 border-b">
          <current.icon className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground tracking-tight">{current.title}</h2>
        </div>

        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nome completo" required>
              <Input value={form.nome} onChange={e => update("nome", e.target.value)} className={inputCls("nome")} placeholder="Ex.: João Miguel Fernandes" />
            </Field>
            <Field label="Nº de Bilhete de Identidade" required>
              <Input value={form.bi} onChange={e => update("bi", e.target.value)} className={inputCls("bi")} placeholder="000000000LA000" />
            </Field>
            <Field label="Data de nascimento" required>
              <Input type="date" value={form.nascimento} onChange={e => update("nascimento", e.target.value)} className={inputCls("nascimento")} />
            </Field>
            <Field label="Género" required>
              <Select value={form.genero} onValueChange={v => update("genero", v)}>
                <SelectTrigger className={inputCls("genero")}><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="feminino">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Naturalidade" required>
              <Input value={form.naturalidade} onChange={e => update("naturalidade", e.target.value)} className={inputCls("naturalidade")} placeholder="Ex.: Luanda" />
            </Field>
            <Field label="Nacionalidade">
              <Input value={form.nacionalidade} onChange={e => update("nacionalidade", e.target.value)} />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Email pessoal" required>
              <Input type="email" value={form.email} onChange={e => update("email", e.target.value)} className={inputCls("email")} placeholder="nome@email.com" />
            </Field>
            <Field label="Telemóvel" required>
              <Input value={form.telemovel} onChange={e => update("telemovel", e.target.value)} className={inputCls("telemovel")} placeholder="+244 9XX XXX XXX" />
            </Field>
            <Field label="Província" required>
              <Select value={form.provincia} onValueChange={v => update("provincia", v)}>
                <SelectTrigger className={inputCls("provincia")}><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{PROVINCIAS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Município" required>
              <Input value={form.municipio} onChange={e => update("municipio", e.target.value)} className={inputCls("municipio")} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Bairro / Endereço">
                <Input value={form.endereco} onChange={e => update("endereco", e.target.value)} placeholder="Rua, número, referência" />
              </Field>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nome completo" required>
              <Input value={form.encNome} onChange={e => update("encNome", e.target.value)} className={inputCls("encNome")} />
            </Field>
            <Field label="Nº de BI" required>
              <Input value={form.encBi} onChange={e => update("encBi", e.target.value)} className={inputCls("encBi")} />
            </Field>
            <Field label="Parentesco" required>
              <Select value={form.encParentesco} onValueChange={v => update("encParentesco", v)}>
                <SelectTrigger className={inputCls("encParentesco")}><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{PARENTESCO.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Telefone" required>
              <Input value={form.encTelefone} onChange={e => update("encTelefone", e.target.value)} className={inputCls("encTelefone")} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Email">
                <Input type="email" value={form.encEmail} onChange={e => update("encEmail", e.target.value)} />
              </Field>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Escola de proveniência" required>
              <Input value={form.escola} onChange={e => update("escola", e.target.value)} className={inputCls("escola")} />
            </Field>
            <Field label="Tipo de ensino" required>
              <Select value={form.tipoEnsino} onValueChange={v => update("tipoEnsino", v)}>
                <SelectTrigger className={inputCls("tipoEnsino")}><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="medio">Ensino Médio</SelectItem>
                  <SelectItem value="tecnico">Ensino Técnico</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Ano de conclusão" required>
              <Input type="number" min="1990" max="2030" value={form.anoConclusao} onChange={e => update("anoConclusao", e.target.value)} className={inputCls("anoConclusao")} placeholder="Ex.: 2024" />
            </Field>
            <Field label="Média final (0–20)" required>
              <Input type="number" min="0" max="20" step="0.1" value={form.mediaFinal} onChange={e => update("mediaFinal", e.target.value)} className={inputCls("mediaFinal")} />
            </Field>
          </div>
        )}

        {step === 5 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Field label="Faculdade" required>
                <Select value={form.faculdade} onValueChange={v => { update("faculdade", v); update("curso1", ""); update("curso2", ""); }}>
                  <SelectTrigger className={inputCls("faculdade")}><SelectValue placeholder="Selecione a faculdade" /></SelectTrigger>
                  <SelectContent>{Object.keys(FACULDADES).map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Curso (1ª opção)" required>
              <Select value={form.curso1} onValueChange={v => update("curso1", v)} disabled={!cursos.length}>
                <SelectTrigger className={inputCls("curso1")}><SelectValue placeholder={cursos.length ? "Selecione" : "Selecione faculdade primeiro"} /></SelectTrigger>
                <SelectContent>{cursos.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Curso (2ª opção)">
              <Select value={form.curso2} onValueChange={v => update("curso2", v)} disabled={!cursos.length}>
                <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                <SelectContent>{cursos.filter(c => c !== form.curso1).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Sessão de Prova de Acesso" required>
                <Select value={form.sessao} onValueChange={v => update("sessao", v)}>
                  <SelectTrigger className={inputCls("sessao")}><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{SESSOES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DOCS.map(d => {
              const file = docs[d.key];
              return (
                <div key={d.key} className={cn(
                  "rounded-lg border p-3 flex items-center justify-between gap-3 transition-colors",
                  file ? "border-emerald-200 bg-emerald-50/50" : "border-dashed bg-muted/30"
                )}>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-foreground truncate">{d.label}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{file || "Em falta"}</p>
                  </div>
                  <input
                    type="file"
                    ref={el => (fileRefs.current[d.key] = el)}
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) setDocs(p => ({ ...p, [d.key]: f.name }));
                    }}
                  />
                  <Button
                    type="button" variant={file ? "outline" : "default"} size="sm"
                    className="h-7 text-[11px] gap-1.5 shrink-0"
                    onClick={() => fileRefs.current[d.key]?.click()}
                  >
                    {file ? <><CheckCircle2 className="w-3 h-3" />Substituir</> : <><Upload className="w-3 h-3" />Carregar</>}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {step === 7 && (
          <div className="space-y-5">
            <ReviewBlock title="Dados Pessoais" items={[
              ["Nome", form.nome], ["BI", form.bi], ["Nascimento", form.nascimento],
              ["Género", form.genero], ["Naturalidade", form.naturalidade], ["Nacionalidade", form.nacionalidade],
            ]} />
            <ReviewBlock title="Contactos & Morada" items={[
              ["Email", form.email], ["Telemóvel", form.telemovel],
              ["Província", form.provincia], ["Município", form.municipio], ["Endereço", form.endereco],
            ]} />
            <ReviewBlock title="Encarregado" items={[
              ["Nome", form.encNome], ["BI", form.encBi], ["Parentesco", form.encParentesco],
              ["Telefone", form.encTelefone], ["Email", form.encEmail],
            ]} />
            <ReviewBlock title="Formação Académica" items={[
              ["Escola", form.escola], ["Tipo", form.tipoEnsino],
              ["Ano conclusão", form.anoConclusao], ["Média", form.mediaFinal],
            ]} />
            <ReviewBlock title="Curso & Sessão" items={[
              ["Faculdade", form.faculdade], ["1ª opção", form.curso1],
              ["2ª opção", form.curso2 || "—"], ["Sessão", form.sessao],
            ]} />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Documentos</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {DOCS.map(d => (
                  <div key={d.key} className="flex items-center justify-between text-[12px] px-3 py-2 rounded-md border bg-muted/20">
                    <span className="text-foreground">{d.label}</span>
                    {docs[d.key]
                      ? <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Carregado</Badge>
                      : <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">Em falta</Badge>}
                  </div>
                ))}
              </div>
            </div>

            <label className={cn(
              "flex items-start gap-2.5 cursor-pointer text-[13px] p-3 rounded-md border bg-muted/20",
              errors.has("confirmar") && "border-destructive text-destructive"
            )}>
              <Checkbox checked={form.confirmar} onCheckedChange={c => update("confirmar", !!c)} className="mt-0.5" />
              <span>Confirmo que os dados inseridos são verdadeiros e que o candidato possui os documentos originais.</span>
            </label>
          </div>
        )}
      </Card>

      {/* Nav */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={prev} disabled={step === 1} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Anterior
        </Button>
        <p className="text-[12px] text-muted-foreground hidden md:block">Passo {step} de {STEPS.length}</p>
        {step < STEPS.length ? (
          <Button onClick={next} className="gap-1.5">
            Próximo <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={submit} className="gap-1.5">
            <Send className="w-4 h-4" /> Submeter Candidatura
          </Button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── small components ─────────────────────────── */

function KpiCard({ icon: Icon, label, value, tone, suffix }: {
  icon: any; label: string; value: number | string; tone: "primary" | "blue" | "emerald" | "amber"; suffix?: string;
}) {
  const tones: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    blue:    "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber:   "bg-amber-50 text-amber-600",
  };
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", tones[tone])}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {suffix && <span className="text-[12px] text-muted-foreground">{suffix}</span>}
      </div>
    </Card>
  );
}

function ReviewBlock({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">{title}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 px-3 py-2.5 rounded-md border bg-muted/20">
        {items.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 text-[12.5px] py-0.5">
            <span className="text-muted-foreground">{k}</span>
            <span className="text-foreground font-medium text-right truncate">{v || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
