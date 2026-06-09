import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { candidaturas, estadoColors, estadoLabels } from "@/data/admissoesData";
import {
  ArrowLeft, CheckCircle2, ChevronDown, FileText, Eye, Download, Clock,
  User, MapPin, BookOpen, CalendarDays, ClipboardCheck, Check, GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CandidaturaDocPreview from "./CandidaturaDocPreview";

const estadoDot: Record<string, string> = {
  pendente: "bg-amber-500",
  aprovado: "bg-emerald-500",
  reprovado: "bg-destructive",
  incompleto: "bg-amber-500",
};

interface InfoRow { label: string; value: string }
interface StepDef {
  n: number;
  title: string;
  sub: string;
  icon: typeof User;
  rows: InfoRow[];
}

function buildSteps(c: typeof candidaturas[number]): StepDef[] {
  const [first, ...rest] = c.nome.split(" ");
  const last = rest.join(" ") || "Silva";
  const opcoes = [c.cursoOpcao1, c.cursoOpcao2, c.cursoOpcao3].filter(Boolean) as string[];

  return [
    {
      n: 1, title: "Dados Pessoais", sub: "Identificação, documento e foto", icon: User,
      rows: [
        { label: "Primeiro nome", value: first },
        { label: "Último nome", value: last },
        { label: "Data de nascimento", value: "12/03/2006" },
        { label: "Género", value: "Masculino" },
        { label: "Nacionalidade", value: "Angolana" },
        { label: "Tipo de documento", value: "Bilhete de Identidade" },
        { label: "Número do documento", value: c.bi },
        { label: "Foto tipo passe", value: "foto_passe.jpg · entregue" },
      ],
    },
    {
      n: 2, title: "Morada & Contactos", sub: "Endereço, contactos e encarregado", icon: MapPin,
      rows: [
        { label: "Província", value: "Luanda" },
        { label: "Município", value: "Belas" },
        { label: "Endereço", value: "Rua Comandante Gika, nº 124, Bairro Maianga" },
        { label: "Email", value: c.email },
        { label: "Telemóvel", value: c.telefone },
        { label: "Encarregado", value: "Maria Joana " + last },
        { label: "Parentesco", value: "Mãe" },
        { label: "Profissão", value: "Professora" },
        { label: "Telefone do encarregado", value: "+244 923 111 222" },
      ],
    },
    {
      n: 3, title: "Formação", sub: "Histórico do ensino secundário", icon: GraduationCap,
      rows: [
        { label: "Escola de origem", value: "Instituto Médio Politécnico de Luanda" },
        { label: "Ano de conclusão", value: "2025" },
        { label: "Declaração de finalização do ensino médio", value: "declaracao_finalizacao.pdf · entregue" },
        { label: "Certificado de habilitações (notas)", value: "certificado_notas.pdf · entregue" },
      ],
    },
    {
      n: 4, title: "Curso", sub: "Faculdades e cursos por ordem de escolha", icon: BookOpen,
      rows: opcoes.map((o, i) => ({
        label: `${i + 1}ª opção`,
        value: `${o} — Faculdade de Ciências Exatas`,
      })),
    },
    {
      n: 5, title: "Entrevista", sub: "Marcação da data de entrevista", icon: CalendarDays,
      rows: [
        { label: "Data", value: "15 de julho de 2026" },
        { label: "Hora", value: "10:30" },
        { label: "Local", value: "Sala de Entrevistas — Campus UPRA" },
        { label: "Estado", value: "Realizada" },
      ],
    },
    {
      n: 6, title: "Curso Preparatório", sub: "Opcional — escolha da sessão", icon: ClipboardCheck,
      rows: [
        { label: "Inscrição", value: "Sim" },
        { label: "Sessão", value: "1ª Sessão · 18 de julho de 2026" },
        { label: "Hora", value: "09:00" },
        { label: "Local", value: "Anfiteatro A — Campus UPRA" },
      ],
    },
    {
      n: 7, title: "Revisão & Submissão", sub: "Confirmação final do candidato", icon: Check,
      rows: [
        { label: "Confirmação dos dados", value: "Aceite pelo candidato" },
        { label: "Autenticidade dos documentos", value: "Declarada pelo candidato" },
        { label: "Data de submissão", value: new Date(c.dataSubmissao).toLocaleDateString("pt-AO") },
      ],
    },
  ];
}

function buildCronologia(c: typeof candidaturas[number]) {
  const sub = new Date(c.dataSubmissao);
  const entrevista = new Date(sub.getTime() + 12 * 86400000);
  const cursoPrep = new Date(sub.getTime() + 35 * 86400000);
  const exame = new Date(sub.getTime() + 60 * 86400000);
  return [
    { data: sub.toISOString(), accao: "Candidatura submetida", detalhe: "Formulário online preenchido pelo candidato" },
    { data: entrevista.toISOString(), accao: "Entrevista", detalhe: "Realizada — Sala de Entrevistas, Campus UPRA" },
    { data: cursoPrep.toISOString(), accao: "Curso Preparatório", detalhe: "Inscrito — 1ª Sessão (Anfiteatro A)" },
    { data: exame.toISOString(), accao: "Exame de Acesso", detalhe: "Marcado — Edifício Central, Sala 04" },
  ];
}

export default function GapCandidaturaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const c = candidaturas.find(x => x.id === id);
  const [openStep, setOpenStep] = useState<number | null>(1);

  if (!c) return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Voltar</button>
      <p className="text-muted-foreground text-center py-12">Candidatura não encontrada.</p>
    </div>
  );

  const steps = buildSteps(c);
  const cronologia = buildCronologia(c);
  const docsEntregues = c.documentos.length;
  // Garantia: nunca exibir "incompleto" — qualquer candidatura é tratada como pelo menos "pendente"
  const estadoFinal = c.estado === "incompleto" ? "pendente" : c.estado;

  const dSub = new Date(c.dataSubmissao);
  const photoIdx = (parseInt(c.id.replace(/\D/g, ""), 10) % 70) + 1;
  const anoCand = dSub.getFullYear();
  const numCand = c.id.replace(/\D/g, "").padStart(4, "0");
  const displayId = `CAND-${anoCand}-${numCand}`;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <Link to="/gap/candidaturas" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar a Candidaturas
      </Link>

      <Card className="overflow-hidden p-0 gap-0">
        {/* Top bar — breadcrumb */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-border bg-muted/20 text-[10px] uppercase tracking-[0.12em] font-semibold">
          <span className="text-primary">Admissões {c.periodo}</span>
          <span className="text-muted-foreground/40">·</span>
          <Link to="/gap/candidaturas" className="text-muted-foreground hover:text-foreground transition-colors">Candidaturas</Link>
          <span className="text-muted-foreground/40">·</span>
          <span className="font-mono text-foreground normal-case tracking-normal">{displayId}</span>
        </div>

        {/* Title block — photo + name + badges + doc pill */}
        <div className="px-6 pt-4 pb-4">
          <div className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
            {/* Photo tipo passe */}
            <img
              src={`https://i.pravatar.cc/120?img=${photoIdx}`}
              alt={`Foto tipo passe — ${c.nome}`}
              className="shrink-0 w-[60px] h-[78px] rounded-md object-cover border border-border bg-muted"
            />

            {/* Name + badges */}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold leading-tight tracking-tight text-foreground">
                {c.nome}
              </h1>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Candidatura submetida em {dSub.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })}
              </p>
              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                <Badge variant="outline" className={cn("text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider gap-1", estadoColors[estadoFinal])}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", estadoDot[estadoFinal])} />
                  {estadoLabels[estadoFinal]}
                </Badge>
                <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider gap-1 bg-blue-50 text-blue-700 border-blue-200">
                  <CheckCircle2 className="w-3 h-3" />
                  {steps.length}/{steps.length} etapas
                </Badge>
              </div>
            </div>

            {/* Right — ID + Doc pill */}
            <div className="shrink-0 flex flex-col items-end gap-1.5">
              <button
                type="button"
                onClick={() => { navigator.clipboard?.writeText(c.id); toast({ title: "ID copiado", description: c.id }); }}
                className="inline-flex items-center px-2 py-0.5 rounded-md border border-border bg-background hover:bg-muted text-[11px] font-mono font-semibold text-foreground transition-colors"
              >
                {c.id}
              </button>
              <div className="inline-flex items-center gap-2 pl-1.5 pr-1 py-1 rounded-md border border-border bg-background shadow-sm">
                <div className="w-6 h-6 rounded bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                  <FileText className="w-3 h-3 text-red-600" />
                </div>
                <div className="flex flex-col min-w-0 leading-tight">
                  <span className="text-[11px] font-semibold text-foreground tabular-nums">Cand-{c.id}</span>
                  <span className="text-[9px] tracking-[0.02em] text-muted-foreground font-medium">
                    Gerado automaticamente
                  </span>
                </div>
                <span className="self-stretch w-px bg-border mx-0.5" />
                <Dialog>
                  <DialogTrigger asChild>
                    <button type="button" className="w-5 h-5 rounded inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Ver documento">
                      <Eye className="w-3 h-3" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl w-[95vw] h-[92vh] p-0 gap-0 overflow-hidden">
                    <DialogHeader className="sr-only">
                      <DialogTitle>Documento Cand-{c.id}</DialogTitle>
                      <DialogDescription>Pré-visualização do documento institucional gerado.</DialogDescription>
                    </DialogHeader>
                    <CandidaturaDocPreview candidatura={c} steps={steps} cronologia={cronologia} />
                  </DialogContent>
                </Dialog>
                <button
                  type="button"
                  onClick={() => toast({ title: "Documento exportado", description: `Cand-${c.id}.pdf` })}
                  className="w-5 h-5 rounded inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title="Exportar"
                >
                  <Download className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>


      {/* Documentos + Linha do Tempo — agora EM CIMA */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Documentos */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b bg-muted/30">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" /> Documentos ({docsEntregues})
            </h3>
          </div>
          <div className="divide-y divide-border">
            {c.documentos.map((d, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-foreground">{d.nome}</span>
                </div>
                <Badge variant="outline" className="text-[10px] bg-green-50 text-green-600 border-green-200">
                  Entregue
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Cronologia */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b bg-muted/30">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" /> Linha do Tempo
            </h3>
          </div>
          <div className="p-5">
            <div className="relative pl-6 space-y-4">
              {cronologia.map((h, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                  {i < cronologia.length - 1 && <div className="absolute -left-[18px] top-4 w-px h-full bg-border" />}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{h.accao}</p>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {new Date(h.data).toLocaleDateString("pt-AO")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{h.detalhe}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Etapas — clicáveis, expandem para mostrar info */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Etapas do Processo de Candidatura</h3>
          <div className="flex items-center gap-3">
            <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-green-600" style={{ width: "100%" }} />
            </div>
            <span className="text-xs font-medium text-foreground tabular-nums">
              {steps.length}/{steps.length}
            </span>
          </div>
        </div>
        <div className="divide-y divide-border">
          {steps.map(s => {
            const Icon = s.icon;
            const open = openStep === s.n;
            return (
              <div key={s.n}>
                <button
                  onClick={() => setOpenStep(open ? null : s.n)}
                  className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">{s.n}. {s.title}</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-green-50 text-green-600 border-green-200">
                    Completo
                  </Badge>
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", open && "rotate-180")} />
                </button>
                {open && (
                  <div className="px-5 pb-5 pt-1 bg-muted/20">
                    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 pl-12">
                      {s.rows.map((r, i) => (
                        <div key={i}>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{r.label}</p>
                          <p className="text-sm text-foreground mt-0.5">{r.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
