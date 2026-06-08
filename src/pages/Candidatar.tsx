import { useRef, useState } from "react";
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
  BookOpen, FileText, Upload, CheckCircle2, Send, Sparkles, Mail, Trash2, Paperclip, Clock, Calendar,
} from "lucide-react";
import logoUpra from "@/assets/logo-upra.asset.json";

const FACULDADES: Record<string, string[]> = {
  "Faculdade de Ciências Exatas": ["Arquitectura", "Engenharia Informática", "Engenharia Civil"],
  "Faculdade de Ciências Sociais": ["Direito", "Economia", "Gestão"],
  "Faculdade de Saúde": ["Medicina", "Enfermagem"],
};
const PROVINCIAS = ["Luanda", "Benguela", "Huíla", "Huambo", "Cabinda", "Cuanza Sul", "Malanje", "Uíge"];
const SESSOES = ["1ª Sessão", "2ª Sessão", "3ª Sessão"];
const PARENTESCO = ["Pai", "Mãe", "Tutor(a)", "Avô/Avó", "Outro"];
const DOCS = [
  { key: "bi", label: "Bilhete de Identidade", desc: "Frente e verso · PDF ou JPG" },
  { key: "notas", label: "Declaração de Notas", desc: "Emitida pela escola de origem" },
  { key: "certidao", label: "Certidão de Habilitações", desc: "Documento oficial assinado" },
  { key: "foto", label: "Foto tipo passe", desc: "Fundo branco, formato 35×45mm" },
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
  { n: 1, title: "Pessoais",      icon: User },
  { n: 2, title: "Contactos",     icon: MapPin },
  { n: 3, title: "Encarregado",   icon: ShieldCheck },
  { n: 4, title: "Formação",      icon: GraduationCap },
  { n: 5, title: "Curso",         icon: BookOpen },
  { n: 6, title: "Documentos",    icon: FileText },
  { n: 7, title: "Revisão",       icon: Check },
] as const;

const STEP_DESC: Record<number, string> = {
  1: "Identificação do candidato",
  2: "Onde podemos contactá-lo",
  3: "Responsável legal pelo candidato",
  4: "Histórico no ensino secundário",
  5: "Faculdade, curso e sessão de provas",
  6: "Anexos obrigatórios da candidatura",
  7: "Confirme e submeta a candidatura",
};

const STEP_FIELDS: Record<number, (keyof FormState)[]> = {
  1: ["nome","bi","nascimento","genero"],
  2: ["email","telemovel","provincia","municipio"],
  3: ["encNome","encParentesco","encTelefone"],
  4: ["escola","anoConclusao","mediaFinal"],
  5: ["faculdade","curso1","sessao"],
  6: [],
  7: [],
};

function Field({ label, required, children, hint, full }: { label: string; required?: boolean; children: React.ReactNode; hint?: string; full?: boolean }) {
  return (
    <div className={cn("space-y-1.5", full && "md:col-span-2")}>
      <Label className="text-[12px] font-medium text-foreground">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

interface DocFile { name: string; size: number }

export default function Candidatar() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(empty);
  const [docs, setDocs] = useState<Record<string, DocFile | null>>({});
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [done, setDone] = useState<string | null>(null);
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
  const isStepComplete = (s: number) => validateStep(s).size === 0;
  const next = () => {
    const m = validateStep(step);
    if (m.size) {
      setErrors(m);
      toast({ title: "Campos em falta", description: "Preencha os campos obrigatórios para continuar.", variant: "destructive" });
      return;
    }
    setErrors(new Set());
    setStep(s => Math.min(STEPS.length, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const prev = () => { setErrors(new Set()); setStep(s => Math.max(1, s - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const goTo = (n: number) => { setErrors(new Set()); setStep(n); window.scrollTo({ top: 0, behavior: "smooth" }); };

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

  const onFile = (key: string, file: File | undefined) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Ficheiro muito grande", description: "Máximo 5MB por documento.", variant: "destructive" });
      return;
    }
    setDocs(p => ({ ...p, [key]: { name: file.name, size: file.size } }));
  };
  const removeDoc = (key: string) => {
    setDocs(p => ({ ...p, [key]: null }));
    if (fileRefs.current[key]) fileRefs.current[key]!.value = "";
  };
  const fmtSize = (b: number) => b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;

  const current = STEPS[step - 1];
  const progress = Math.round((step / STEPS.length) * 100);
  const docsCount = Object.values(docs).filter(Boolean).length;

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

  /* ───────── Intro screen ───────── */
  if (!started) {
    const elegibilidade = [
      "12.ª classe concluída ou equivalente reconhecido",
      "Bilhete de Identidade válido",
      "Documentos legíveis e autenticados",
      "Aprovação nas provas de admissão presenciais",
    ];
    return (
      <div className="h-screen overflow-hidden bg-muted/30 flex flex-col">
        <main className="flex-1 flex items-center justify-center px-6 py-6 min-h-0">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-5 text-center border-b border-border">
              <img src={logoUpra.url} alt="UPRA" className="w-12 h-12 rounded-xl object-cover mx-auto mb-3" />
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-[10px]">
                Ano lectivo 2026/2027
              </Badge>
              <h1 className="mt-2.5 text-xl font-bold text-foreground tracking-tight">Candidatura UPRA</h1>
              <p className="mt-1 text-[12px] text-muted-foreground">Formulário online · 7 etapas guiadas</p>
            </div>

            <div className="px-6 py-5">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-2.5">
                Critérios de elegibilidade
              </p>
              <ul className="space-y-2">
                {elegibilidade.map((c, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                    <p className="text-[12.5px] text-foreground leading-snug">{c}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-6 pb-6">
              <Button size="lg" onClick={() => setStarted(true)} className="w-full gap-2">
                Iniciar candidatura <ArrowRight className="w-4 h-4" />
              </Button>
              <p className="text-[11px] text-muted-foreground text-center mt-2.5">
                Dúvidas? <a href="mailto:admissoes@upra.ao" className="text-primary underline-offset-2 hover:underline">admissoes@upra.ao</a>
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }






  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/site" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-foreground">UPRA</p>
              <p className="text-[10px] text-muted-foreground">Candidatura 2026/2027</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[12px] text-muted-foreground tabular-nums">{progress}% completo</span>
            <Button variant="ghost" size="sm" onClick={() => navigate("/site")} className="gap-1.5 h-9 text-[12px]">
              <ArrowLeft className="w-3.5 h-3.5" /> Sair
            </Button>
          </div>
        </div>
        <div className="h-1 bg-muted">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </header>

      {/* Stepper (top, clickable) */}
      <div className="bg-background border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between gap-1 overflow-x-auto">
            {STEPS.map((s, i) => {
              const isDone = step > s.n && isStepComplete(s.n);
              const isActive = step === s.n;
              const Icon = s.icon;
              return (
                <div key={s.n} className="flex items-center flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => goTo(s.n)}
                    className="group flex flex-col items-center gap-1.5 shrink-0 transition-opacity"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                      isDone && "bg-primary border-primary text-primary-foreground",
                      isActive && "bg-primary/10 border-primary text-primary ring-4 ring-primary/10",
                      !isDone && !isActive && "bg-background border-border text-muted-foreground group-hover:border-primary/40 group-hover:text-foreground",
                    )}>
                      {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className={cn(
                      "text-[11px] font-medium tracking-tight whitespace-nowrap hidden sm:block",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}>{s.title}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={cn(
                      "h-0.5 flex-1 mx-1 sm:mx-2 rounded-full transition-colors",
                      step > s.n ? "bg-primary" : "bg-border",
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-5">
        {/* Title */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
            <current.icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-primary font-semibold">Passo {step} de {STEPS.length}</p>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">{current.title}</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">{STEP_DESC[step]}</p>
          </div>
        </div>

        <Card className="p-6 lg:p-8 shadow-sm">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nome completo" required full>
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
              <Field label="Morada" full>
                <Input value={form.endereco} onChange={e => update("endereco", e.target.value)} placeholder="Rua, número, bairro" maxLength={200} />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nome do encarregado de educação" required full>
                <Input value={form.encNome} onChange={e => update("encNome", e.target.value)} className={inputCls("encNome")} placeholder="Nome completo" maxLength={120} />
              </Field>
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
              <Field label="Escola de origem" required full>
                <Input value={form.escola} onChange={e => update("escola", e.target.value)} className={inputCls("escola")} placeholder="Ex.: Liceu Mutu-Ya-Kevela" maxLength={120} />
              </Field>
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
                    <SelectTrigger className={inputCls("curso1")}><SelectValue placeholder={form.faculdade ? "Selecione" : "Escolha uma faculdade"} /></SelectTrigger>
                    <SelectContent>
                      {cursos.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Curso (2ª opção)" hint="Opcional · usado se a 1ª opção não estiver disponível">
                  <Select value={form.curso2} onValueChange={v => update("curso2", v)} disabled={!form.faculdade}>
                    <SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                    <SelectContent>
                      {cursos.filter(c => c !== form.curso1).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Carta de motivação" hint={`${form.motivacao.length}/500 caracteres`}>
                <Textarea value={form.motivacao} onChange={e => update("motivacao", e.target.value.slice(0, 500))} rows={4} placeholder="Conte-nos porque escolheu este curso..." maxLength={500} />
              </Field>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-[12.5px] text-muted-foreground">
                  Anexe os documentos abaixo. Formatos aceites: PDF, JPG, PNG · máx. 5MB cada.
                </p>
                <Badge variant="outline" className="text-[11px]">{docsCount}/{DOCS.length} anexados</Badge>
              </div>
              <div className="space-y-2.5">
                {DOCS.map(d => {
                  const file = docs[d.key];
                  return (
                    <div key={d.key} className={cn(
                      "rounded-xl border transition-colors",
                      file ? "border-accent/40 bg-accent/5" : "border-border bg-card hover:border-primary/30"
                    )}>
                      <input
                        ref={el => (fileRefs.current[d.key] = el)}
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={e => onFile(d.key, e.target.files?.[0])}
                      />
                      <div className="flex items-center gap-3 p-3.5">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                          file ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                        )}>
                          {file ? <Check className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground leading-tight">{d.label}</p>
                          {file ? (
                            <p className="text-[11.5px] text-foreground/70 mt-0.5 flex items-center gap-1.5 truncate">
                              <Paperclip className="w-3 h-3 shrink-0" />
                              <span className="truncate">{file.name}</span>
                              <span className="text-muted-foreground">· {fmtSize(file.size)}</span>
                            </p>
                          ) : (
                            <p className="text-[11.5px] text-muted-foreground mt-0.5">{d.desc}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {file && (
                            <Button variant="ghost" size="sm" onClick={() => removeDoc(d.key)} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button
                            variant={file ? "outline" : "default"}
                            size="sm"
                            onClick={() => fileRefs.current[d.key]?.click()}
                            className="h-8 gap-1.5 text-[12px]"
                          >
                            <Upload className="w-3.5 h-3.5" /> {file ? "Substituir" : "Anexar"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Quase lá!</p>
                  <p className="text-[12.5px] text-muted-foreground mt-0.5">Reveja os dados abaixo. Pode voltar a qualquer passo clicando nele acima.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReviewBlock title="Dados Pessoais" stepN={1} onEdit={goTo} rows={[
                  ["Nome", form.nome], ["BI", form.bi],
                  ["Nascimento", form.nascimento], ["Género", form.genero],
                ]} />
                <ReviewBlock title="Contactos" stepN={2} onEdit={goTo} rows={[
                  ["Email", form.email], ["Telemóvel", form.telemovel],
                  ["Província", form.provincia], ["Município", form.municipio],
                ]} />
                <ReviewBlock title="Encarregado" stepN={3} onEdit={goTo} rows={[
                  ["Nome", form.encNome], ["Parentesco", form.encParentesco],
                  ["Telefone", form.encTelefone],
                ]} />
                <ReviewBlock title="Formação" stepN={4} onEdit={goTo} rows={[
                  ["Escola", form.escola], ["Conclusão", form.anoConclusao],
                  ["Média", form.mediaFinal],
                ]} />
                <ReviewBlock title="Curso" stepN={5} onEdit={goTo} rows={[
                  ["Faculdade", form.faculdade], ["1ª opção", form.curso1],
                  ["2ª opção", form.curso2 || "—"], ["Sessão", form.sessao],
                ]} />
                <ReviewBlock title="Documentos" stepN={6} onEdit={goTo} rows={DOCS.map(d => [d.label, docs[d.key] ? "✓ Anexado" : "Pendente"])} />
              </div>

              <label className={cn("flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors",
                errors.has("confirmar") ? "border-destructive bg-destructive/5" : "border-border hover:bg-muted/40")}>
                <Checkbox checked={form.confirmar} onCheckedChange={c => update("confirmar", !!c)} className="mt-0.5" />
                <div className="text-[12.5px] text-foreground">
                  Confirmo que os dados acima são verdadeiros e autorizo a UPRA a tratar a minha candidatura
                  de acordo com a política de privacidade da instituição.
                </div>
              </label>
            </div>
          )}
        </Card>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 pt-1">
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
  );
}

function ReviewBlock({ title, rows, stepN, onEdit }: { title: string; rows: [string, string | undefined][]; stepN: number; onEdit: (n: number) => void }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">{title}</p>
        <button onClick={() => onEdit(stepN)} className="text-[11px] text-primary hover:underline font-medium">Editar</button>
      </div>
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
