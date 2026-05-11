import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  User, MapPin, ShieldCheck, GraduationCap, BookOpen, FileText,
  Upload, CheckCircle2, RotateCcw, Send,
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

const REQUIRED: (keyof FormState)[] = [
  "nome","bi","nascimento","genero","naturalidade","email","telemovel","provincia","municipio",
  "encNome","encBi","encParentesco","encTelefone","escola","tipoEnsino","anoConclusao","mediaFinal",
  "faculdade","curso1","sessao",
];

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b">
        <Icon className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground tracking-tight">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
    </section>
  );
}

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

export default function InscricoesRegistar() {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(empty);
  const [docs, setDocs] = useState<Record<string, string | null>>({});
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [lastRef, setLastRef] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors.has(k)) {
      const n = new Set(errors); n.delete(k); setErrors(n);
    }
  };

  const cursos = form.faculdade ? FACULDADES[form.faculdade] || [] : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const missing = new Set<string>();
    REQUIRED.forEach(k => { if (!String(form[k]).trim()) missing.add(k); });
    if (!form.confirmar) missing.add("confirmar");
    if (missing.size) {
      setErrors(missing);
      toast({ title: "Campos em falta", description: "Reveja os campos obrigatórios em destaque.", variant: "destructive" });
      return;
    }
    const ref = `CAND-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setLastRef(ref);
    setForm(empty);
    setDocs({});
    setErrors(new Set());
    toast({ title: "Candidatura criada", description: `${ref} — estudante registado com sucesso.` });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => { setForm(empty); setDocs({}); setErrors(new Set()); setLastRef(null); };

  const inputCls = (k: string) => cn(errors.has(k) && "border-destructive focus-visible:ring-destructive");

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-8 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Registar Novo Estudante</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Preencha os dados abaixo para criar a candidatura. Os campos marcados com <span className="text-destructive">*</span> são obrigatórios.
        </p>
      </div>

      {lastRef && (
        <Card className="p-3 px-4 flex items-center gap-3 border-emerald-200 bg-emerald-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="text-[13px] text-emerald-900">
            <span className="font-semibold">Candidatura {lastRef}</span> criada com sucesso — pronto para registar outro estudante.
          </p>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-8">
          {/* 1. Pessoais */}
          <Section icon={User} title="Dados Pessoais">
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
          </Section>

          {/* 2. Contactos */}
          <Section icon={MapPin} title="Contactos & Morada">
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
            <Field label="Bairro / Endereço">
              <Input value={form.endereco} onChange={e => update("endereco", e.target.value)} />
            </Field>
          </Section>

          {/* 3. Encarregado */}
          <Section icon={ShieldCheck} title="Encarregado de Educação">
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
            <Field label="Email">
              <Input type="email" value={form.encEmail} onChange={e => update("encEmail", e.target.value)} />
            </Field>
          </Section>

          {/* 4. Académica */}
          <Section icon={GraduationCap} title="Formação Académica">
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
            <Field label="Média final" required>
              <Input type="number" min="0" max="20" step="0.1" value={form.mediaFinal} onChange={e => update("mediaFinal", e.target.value)} className={inputCls("mediaFinal")} placeholder="0 – 20" />
            </Field>
          </Section>

          {/* 5. Curso */}
          <Section icon={BookOpen} title="Curso Pretendido">
            <Field label="Faculdade" required>
              <Select value={form.faculdade} onValueChange={v => { update("faculdade", v); update("curso1", ""); update("curso2", ""); }}>
                <SelectTrigger className={inputCls("faculdade")}><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{Object.keys(FACULDADES).map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
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
            <Field label="Sessão de Prova" required>
              <Select value={form.sessao} onValueChange={v => update("sessao", v)}>
                <SelectTrigger className={inputCls("sessao")}><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{SESSOES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </Section>

          {/* 6. Documentos */}
          <Section icon={FileText} title="Documentos">
            <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
          </Section>
        </Card>

        {/* Footer actions */}
        <Card className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <label className={cn(
            "flex items-start gap-2.5 cursor-pointer text-[13px]",
            errors.has("confirmar") && "text-destructive"
          )}>
            <Checkbox checked={form.confirmar} onCheckedChange={c => update("confirmar", !!c)} className="mt-0.5" />
            <span>Confirmo que os dados inseridos são verdadeiros e que possuo os documentos originais.</span>
          </label>
          <div className="flex items-center gap-2 shrink-0">
            <Button type="button" variant="outline" onClick={reset} className="gap-1.5">
              <RotateCcw className="w-4 h-4" /> Limpar
            </Button>
            <Button type="submit" className="gap-1.5">
              <Send className="w-4 h-4" /> Submeter Candidatura
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
