import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  GraduationCap, ArrowLeft, ArrowRight, Check, User, MapPin, ShieldCheck,
  BookOpen, FileText, Upload, CheckCircle2, Send, Sparkles, Mail, Phone, Calendar,
} from "lucide-react";

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
];

interface FormState {
  nome: string; bi: string; nascimento: string; genero: string; nacionalidade: string;
  email: string; telemovel: string; provincia: string; municipio: string; endereco: string;
  encNome: string; encParentesco: string; encTelefone: string;
  escola: string; anoConclusao: string; mediaFinal: string;
  faculdade: string; curso1: string; curso2: string; sessao: string;
  motivacao: string; confirmar: boolean;
}
const empty: FormState = {
  nome: "", bi: "", nascimento: "", genero: "", nacionalidade: "Angolana",
  email: "", telemovel: "", provincia: "", municipio: "", endereco: "",
  encNome: "", encParentesco: "", encTelefone: "",
  escola: "", anoConclusao: "", mediaFinal: "",
  faculdade: "", curso1: "", curso2: "", sessao: "",
  motivacao: "", confirmar: false,
};

const STEPS = [
  { n: 1, title: "Dados Pessoais",       icon: User,        desc: "Identificação do candidato" },
  { n: 2, title: "Contactos & Morada",   icon: MapPin,      desc: "Onde podemos contactá-lo" },
  { n: 3, title: "Encarregado",          icon: ShieldCheck, desc: "Responsável legal" },
  { n: 4, title: "Formação",             icon: GraduationCap, desc: "Ensino secundário" },
  { n: 5, title: "Curso pretendido",     icon: BookOpen,    desc: "Faculdade e curso" },
  { n: 6, title: "Documentos",           icon: FileText,    desc: "Anexos obrigatórios" },
  { n: 7, title: "Revisão",              icon: Check,       desc: "Confirmação e envio" },
] as const;

const STEP_FIELDS: Record<number, (keyof FormState)[]> = {
  1: ["nome","bi","nascimento","genero"],
  2: ["email","telemovel","provincia","municipio"],
  3: ["encNome","encParentesco","encTelefone"],
  4: ["escola","anoConclusao","mediaFinal"],
  5: ["faculdade","curso1","sessao"],
  6: [],
  7: [],
};

function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12px] font-medium text-foreground">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function Candidatar() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(empty);
  const [docs, setDocs] = useState<Record<string, string | null>>({});
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [done, setDone] = useState<string | null>(null);

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

  const submit = () => {
    if (!form.confirmar) {
      setErrors(new Set(["confirmar"]));
      toast({ title: "Confirmação necessária", description: "Confirme a veracidade dos dados.", variant: "destructive" });
      return;
    }
    const ref = `CAND-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setDone(ref);
    toast({ title: "Candidatura submetida", description: `${ref} — receberá confirmação por email.` });
  };

  const current = STEPS[step - 1];
  const progress = Math.round((step / STEPS.length) * 100);

  /* ───────── Success screen ───────── */
  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-6">
        <Card className="max-w-lg w-full p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Candidatura submetida</h1>
          <p className="text-sm text-muted-foreground mt-2">
            A sua candidatura foi recebida com sucesso. A equipa de admissões irá analisar e contactá-lo nos próximos dias úteis.
          </p>
          <div className="mt-6 p-4 rounded-xl bg-muted/40 border border-border">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Referência</p>
            <p className="text-2xl font-bold font-mono text-primary mt-1">{done}</p>
            <p className="text-[11px] text-muted-foreground mt-2 flex items-center justify-center gap-1.5">
              <Mail className="w-3 h-3" /> Confirmação enviada para {form.email}
            </p>
          </div>
          <div className="mt-7 flex flex-col sm:flex-row gap-2 justify-center">
            <Link to="/site"><Button variant="outline" className="w-full sm:w-auto">Voltar ao website</Button></Link>
            <Link to="/"><Button className="w-full sm:w-auto gap-2">Aceder ao Portal <ArrowRight className="w-4 h-4" /></Button></Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/site" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-foreground">UPRA</p>
              <p className="text-[10px] text-muted-foreground">Candidatura 2026/2027</p>
            </div>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => navigate("/site")} className="gap-1.5 h-9 text-[12px]">
            <ArrowLeft className="w-3.5 h-3.5" /> Sair
          </Button>
        </div>
        <div className="h-1 bg-muted">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 lg:p-8 grid lg:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar steps */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-1">
            <Badge variant="outline" className="mb-3">Passo {step} de {STEPS.length}</Badge>
            {STEPS.map(s => {
              const isDone = step > s.n;
              const isActive = step === s.n;
              const Icon = s.icon;
              return (
                <button
                  key={s.n}
                  onClick={() => { setErrors(new Set()); setStep(s.n); }}
                  className={cn(
                    "w-full text-left flex items-start gap-3 p-3 rounded-lg border transition-colors",
                    isActive && "bg-primary/5 border-primary/40",
                    !isActive && "border-transparent hover:bg-muted/50",
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                    isDone && "bg-primary border-primary text-primary-foreground",
                    isActive && "bg-primary/10 border-primary text-primary",
                    !isDone && !isActive && "bg-background border-border text-muted-foreground",
                  )}>
                    {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className={cn("text-[12.5px] font-semibold leading-tight", isActive ? "text-foreground" : "text-foreground/80")}>{s.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{s.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Content */}
        <div className="space-y-5">
          {/* Title block */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <current.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Passo {step} · {progress}%</p>
              <h1 className="text-2xl font-bold text-foreground leading-tight">{current.title}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{current.desc}</p>
            </div>
          </div>

          <Card className="p-6 lg:p-7">
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Nome completo" required>
                  <Input value={form.nome} onChange={e => update("nome", e.target.value)} className={inputCls("nome")} placeholder="João Miguel Fernandes" maxLength={120} />
                </Field>
                <Field label="Nº Bilhete de Identidade" required>
                  <Input value={form.bi} onChange={e => update("bi", e.target.value)} className={inputCls("bi")} placeholder="000000000LA000" maxLength={20} />
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
                <Field label="Nacionalidade">
                  <Input value={form.nacionalidade} onChange={e => update("nacionalidade", e.target.value)} maxLength={50} />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Email" required>
                  <Input type="email" value={form.email} onChange={e => update("email", e.target.value)} className={inputCls("email")} placeholder="nome@exemplo.com" maxLength={120} />
                </Field>
                <Field label="Telemóvel" required>
                  <Input value={form.telemovel} onChange={e => update("telemovel", e.target.value)} className={inputCls("telemovel")} placeholder="+244 9XX XXX XXX" maxLength={20} />
                </Field>
                <Field label="Província" required>
                  <Select value={form.provincia} onValueChange={v => update("provincia", v)}>
                    <SelectTrigger className={inputCls("provincia")}><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {PROVINCIAS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Município" required>
                  <Input value={form.municipio} onChange={e => update("municipio", e.target.value)} className={inputCls("municipio")} placeholder="Ex.: Maianga" maxLength={50} />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Morada">
                    <Input value={form.endereco} onChange={e => update("endereco", e.target.value)} placeholder="Rua, número, bairro" maxLength={200} />
                  </Field>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Field label="Nome do encarregado de educação" required>
                    <Input value={form.encNome} onChange={e => update("encNome", e.target.value)} className={inputCls("encNome")} placeholder="Nome completo" maxLength={120} />
                  </Field>
                </div>
                <Field label="Parentesco" required>
                  <Select value={form.encParentesco} onValueChange={v => update("encParentesco", v)}>
                    <SelectTrigger className={inputCls("encParentesco")}><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {PARENTESCO.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Telefone" required>
                  <Input value={form.encTelefone} onChange={e => update("encTelefone", e.target.value)} className={inputCls("encTelefone")} placeholder="+244 9XX XXX XXX" maxLength={20} />
                </Field>
              </div>
            )}

            {step === 4 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Field label="Escola de origem" required>
                    <Input value={form.escola} onChange={e => update("escola", e.target.value)} className={inputCls("escola")} placeholder="Ex.: Liceu Mutu-Ya-Kevela" maxLength={120} />
                  </Field>
                </div>
                <Field label="Ano de conclusão" required>
                  <Input type="number" value={form.anoConclusao} onChange={e => update("anoConclusao", e.target.value)} className={inputCls("anoConclusao")} placeholder="2025" min={1990} max={2030} />
                </Field>
                <Field label="Média final (0-20)" required>
                  <Input type="number" value={form.mediaFinal} onChange={e => update("mediaFinal", e.target.value)} className={inputCls("mediaFinal")} placeholder="14.5" step={0.1} min={0} max={20} />
                </Field>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Faculdade" required>
                    <Select value={form.faculdade} onValueChange={v => { update("faculdade", v); update("curso1", ""); update("curso2", ""); }}>
                      <SelectTrigger className={inputCls("faculdade")}><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {Object.keys(FACULDADES).map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Sessão de provas" required>
                    <Select value={form.sessao} onValueChange={v => update("sessao", v)}>
                      <SelectTrigger className={inputCls("sessao")}><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {SESSOES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Curso (1ª opção)" required>
                    <Select value={form.curso1} onValueChange={v => update("curso1", v)} disabled={!form.faculdade}>
                      <SelectTrigger className={inputCls("curso1")}><SelectValue placeholder={form.faculdade ? "Selecione" : "Escolha primeiro uma faculdade"} /></SelectTrigger>
                      <SelectContent>
                        {cursos.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Curso (2ª opção)" hint="Opcional — usado se a 1ª opção não estiver disponível">
                    <Select value={form.curso2} onValueChange={v => update("curso2", v)} disabled={!form.faculdade}>
                      <SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                      <SelectContent>
                        {cursos.filter(c => c !== form.curso1).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field label="Carta de motivação" hint="Opcional · máx. 500 caracteres">
                  <Textarea value={form.motivacao} onChange={e => update("motivacao", e.target.value.slice(0, 500))} rows={4} placeholder="Conte-nos porque escolheu este curso..." maxLength={500} />
                  <p className="text-[10px] text-muted-foreground text-right mt-1">{form.motivacao.length}/500</p>
                </Field>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-2">
                  Anexe os documentos abaixo (PDF, JPG ou PNG, máx. 5MB cada). Documentos podem ser entregues também presencialmente no balcão.
                </p>
                {DOCS.map(d => {
                  const uploaded = !!docs[d.key];
                  return (
                    <div key={d.key} className={cn(
                      "flex items-center gap-3 p-3.5 rounded-lg border transition-colors",
                      uploaded ? "border-accent/40 bg-accent/5" : "border-border bg-card"
                    )}>
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                        uploaded ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        {uploaded ? <Check className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{d.label}</p>
                        <p className="text-[11px] text-muted-foreground">{uploaded ? docs[d.key] : "Não anexado"}</p>
                      </div>
                      <label>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) setDocs(p => ({ ...p, [d.key]: file.name }));
                          }}
                        />
                        <Button variant="outline" size="sm" type="button" asChild>
                          <span className="cursor-pointer gap-1.5"><Upload className="w-3.5 h-3.5" /> {uploaded ? "Substituir" : "Anexar"}</span>
                        </Button>
                      </label>
                    </div>
                  );
                })}
              </div>
            )}

            {step === 7 && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Quase lá!</p>
                    <p className="text-[12.5px] text-muted-foreground mt-0.5">Reveja os dados abaixo. Após submeter, receberá uma referência e instruções por email.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ReviewBlock title="Dados Pessoais" rows={[
                    ["Nome", form.nome], ["BI", form.bi],
                    ["Nascimento", form.nascimento], ["Género", form.genero],
                  ]} />
                  <ReviewBlock title="Contactos" rows={[
                    ["Email", form.email], ["Telemóvel", form.telemovel],
                    ["Província", form.provincia], ["Município", form.municipio],
                  ]} />
                  <ReviewBlock title="Encarregado" rows={[
                    ["Nome", form.encNome], ["Parentesco", form.encParentesco],
                    ["Telefone", form.encTelefone],
                  ]} />
                  <ReviewBlock title="Formação" rows={[
                    ["Escola", form.escola], ["Conclusão", form.anoConclusao],
                    ["Média", form.mediaFinal],
                  ]} />
                  <ReviewBlock title="Curso" rows={[
                    ["Faculdade", form.faculdade], ["1ª opção", form.curso1],
                    ["2ª opção", form.curso2 || "—"], ["Sessão", form.sessao],
                  ]} />
                  <ReviewBlock title="Documentos" rows={DOCS.map(d => [d.label, docs[d.key] ? "✓ Anexado" : "Pendente"])} />
                </div>

                <label className={cn("flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                  errors.has("confirmar") ? "border-destructive bg-destructive/5" : "border-border hover:bg-muted/30")}>
                  <Checkbox
                    checked={form.confirmar}
                    onCheckedChange={c => update("confirmar", !!c)}
                    className="mt-0.5"
                  />
                  <div className="text-[12.5px] text-foreground">
                    Confirmo que os dados acima são verdadeiros e autorizo a UPRA a tratar a minha candidatura
                    de acordo com a política de privacidade da instituição.
                  </div>
                </label>
              </div>
            )}
          </Card>

          {/* Footer actions */}
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={prev} disabled={step === 1} className="gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Anterior
            </Button>
            {step < STEPS.length ? (
              <Button onClick={next} className="gap-1.5">
                Próximo <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={submit} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                <Send className="w-4 h-4" /> Submeter candidatura
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewBlock({ title, rows }: { title: string; rows: [string, string | undefined][] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-2.5">{title}</p>
      <div className="space-y-1.5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-3 text-[12.5px]">
            <span className="text-muted-foreground shrink-0">{k}</span>
            <span className="font-medium text-foreground text-right truncate">{v || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
