import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { candidaturas, estadoColors, estadoLabels } from "@/data/admissoesData";
import {
  ArrowLeft, CheckCircle2, ChevronDown, FileText, Eye, Download, Clock,
  User, MapPin, BookOpen, CalendarDays, ClipboardCheck, Check, GraduationCap, Calendar, Wallet,
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
  const last = c.nome.split(" ").slice(1).join(" ") || "Silva";
  const opcoes = [c.cursoOpcao1, c.cursoOpcao2, c.cursoOpcao3].filter(Boolean) as string[];

  return [
    {
      n: 1, title: "Dados Pessoais", sub: "Identificação, documento e foto", icon: User,
      rows: [
        { label: "Nome completo", value: c.nome },
        { label: "Data de nascimento", value: "12/03/2006" },
        { label: "Nacionalidade", value: "Angolana" },
        { label: "Género", value: "Masculino" },
        { label: "Tipo de documento", value: "Bilhete de Identidade" },
        { label: "Número do documento", value: c.bi },
        { label: "Foto tipo passe", value: "Entregue" },
      ],
    },
    {
      n: 2, title: "Morada & Contactos", sub: "Endereço, contactos e encarregado", icon: MapPin,
      rows: [
        { label: "Província", value: "Luanda" },
        { label: "Município", value: "Belas" },
        { label: "Email", value: c.email },
        { label: "Telemóvel", value: c.telefone },
        { label: "Endereço", value: "Rua Comandante Gika, nº 124, Bairro Maianga" },
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
        { label: "Média final", value: "15,4 valores" },
        { label: "Certificado de Ensino Médio", value: "Entregue" },
        { label: "Declaração de Notas", value: "Entregue" },
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
      n: 5, title: "Pagamento", sub: "Taxa de candidatura e comprovativo", icon: Wallet,
      rows: [
        { label: "Referência", value: c.pagamento?.referencia ?? "—" },
        { label: "Valor", value: c.pagamento ? `${new Intl.NumberFormat("pt-AO").format(c.pagamento.valor)} Kz` : "—" },
        { label: "Comprovativo", value: c.pagamento?.comprovativo ? "Entregue" : "Por entregar" },
        { label: "Estado", value: c.pagamento?.estado === "confirmado" ? "Confirmado" : "Por confirmar" },
      ],
    },
    {
      n: 6, title: "Entrevista", sub: "Marcação da data de entrevista", icon: CalendarDays,
      rows: [
        { label: "Data", value: "15 de julho de 2026" },
        { label: "Hora", value: "10:30" },
        { label: "Local", value: "Sala de Entrevistas — Campus UPRA" },
        { label: "Responsável", value: "Dra. Helena Cabral" },
        { label: "Estado", value: "Realizada" },
      ],
    },
    {
      n: 7, title: "Curso Preparatório", sub: "Opcional — escolha da sessão", icon: ClipboardCheck,
      rows: [
        { label: "Inscrição", value: "Sim" },
        { label: "Sessão", value: "1ª Sessão · 18 de julho de 2026" },
        { label: "Hora", value: "09:00" },
        { label: "Local", value: "Anfiteatro A — Campus UPRA" },
        { label: "Estado", value: "Inscrito" },
      ],
    },
  ];
}

type EtapaEstado = "completo" | "agendado" | "remarcado" | "falta" | "aprovado" | "reprovado" | "pendente";

const etapaEstadoStyle: Record<EtapaEstado, string> = {
  completo: "bg-green-50 text-green-700 border-green-200",
  aprovado: "bg-green-50 text-green-700 border-green-200",
  agendado: "bg-blue-50 text-blue-700 border-blue-200",
  remarcado: "bg-amber-50 text-amber-700 border-amber-200",
  falta: "bg-red-50 text-red-700 border-red-200",
  reprovado: "bg-red-50 text-red-700 border-red-200",
  pendente: "bg-amber-50 text-amber-700 border-amber-200",
};

function pick<T>(seed: number, arr: T[]): T { return arr[seed % arr.length]; }

function buildCronologia(c: typeof candidaturas[number]) {
  const sub = new Date(c.dataSubmissao);
  const today = new Date();
  const pagamento = new Date(sub.getTime() + 3 * 86400000);
  const entrevista = new Date(sub.getTime() + 12 * 86400000);
  const cursoPrep = new Date(sub.getTime() + 35 * 86400000);
  const exame = new Date(sub.getTime() + 60 * 86400000);
  const seed = parseInt(c.id.replace(/\D/g, ""), 10) || 0;

  // Sequential gating: each step only advances if the previous one is "completo".
  // - Pagamento: completo se o pagamento da candidatura estiver confirmado; senão agendado.
  // - Entrevista: requer Pagamento = completo; completo | remarcado | falta.
  // - Curso Preparatório: requires Entrevista = completo; otherwise agendado.
  // - Exame: requires Curso Preparatório = completo; otherwise agendado.
  const pagEstado: EtapaEstado = c.pagamento?.estado === "confirmado"
    ? "completo"
    : "pendente";
  const pagDone = pagEstado === "completo";
  const pagDetalhe = c.pagamento?.estado === "confirmado"
    ? `Pago — ${c.pagamento.referencia} · ${new Intl.NumberFormat("pt-AO").format(c.pagamento.valor)} Kz`
    : `Pendente — ${c.pagamento?.referencia ?? "—"}`;

  const entrevistaEstado: EtapaEstado = pagDone && entrevista <= today
    ? pick(seed, ["completo", "completo", "remarcado", "falta"] as EtapaEstado[])
    : "agendado";
  const entDone = entrevistaEstado === "completo";

  const cursoPrepEstado: EtapaEstado = entDone && cursoPrep <= today
    ? pick(seed, ["completo", "completo", "remarcado"] as EtapaEstado[])
    : "agendado";
  const cpDone = cursoPrepEstado === "completo";

  const exameEstado: EtapaEstado = cpDone && exame <= today
    ? pick(seed + 1, ["aprovado", "reprovado", "remarcado"] as EtapaEstado[])
    : "agendado";
  const exDone = exameEstado === "aprovado" || exameEstado === "reprovado";
  const exAprovado = exameEstado === "aprovado";

  const matricula = new Date(sub.getTime() + 75 * 86400000);
  const matriculaEstado: EtapaEstado = exAprovado && matricula <= today
    ? pick(seed + 2, ["completo", "completo", "pendente"] as EtapaEstado[])
    : "pendente";
  const matDone = matriculaEstado === "completo";
  const matDetalhe = matDone
    ? "Pago — Taxa de matrícula confirmada"
    : exAprovado ? "Pendente — Aguarda pagamento da matrícula" : "Pendente — Disponível após aprovação no exame";

  return [
    { data: sub.toISOString(), accao: "Candidatura submetida", detalhe: "Formulário online preenchido pelo candidato", done: sub <= today, estado: "completo" as EtapaEstado },
    { data: pagamento.toISOString(), accao: "Pagamento da candidatura", detalhe: pagDetalhe, done: pagDone, estado: pagEstado },
    { data: entrevista.toISOString(), accao: "Entrevista", detalhe: "Realizada — Sala de Entrevistas, Campus UPRA", done: entDone, estado: entrevistaEstado },
    { data: cursoPrep.toISOString(), accao: "Curso Preparatório", detalhe: "Inscrito — 1ª Sessão (Anfiteatro A)", done: cpDone, estado: cursoPrepEstado },
    { data: exame.toISOString(), accao: "Exame de Acesso", detalhe: "Marcado — Edifício Central, Sala 04", done: exDone, estado: exameEstado },
    { data: matricula.toISOString(), accao: "Pagamento da matrícula", detalhe: matDetalhe, done: matDone, estado: matriculaEstado },
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
        <div className="px-6 pt-4 pb-4 border-b border-border">
          <div className="flex items-start gap-3">
            <img
              src={`https://i.pravatar.cc/120?img=${photoIdx}`}
              alt={`Foto tipo passe — ${c.nome}`}
              className="shrink-0 w-[60px] h-[78px] rounded-md object-cover border border-border bg-muted"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold leading-tight tracking-tight text-foreground">{c.nome}</h1>
              <div className="mt-3 flex items-stretch gap-2">
                <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-md border border-border bg-muted/40">
                  <span className={cn("w-2 h-2 rounded-full shrink-0", estadoDot[estadoFinal])} />
                  <div className="flex flex-col leading-tight">
                    <span className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">Estado</span>
                    <span className="text-[11px] font-semibold text-foreground uppercase tracking-wide">
                      {estadoLabels[estadoFinal]}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-md border border-border bg-muted/40">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <div className="flex flex-col leading-tight">
                    <span className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">Data de submissão</span>
                    <span className="text-[11px] font-semibold text-foreground tabular-nums">
                      {dSub.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1.5">
              <button
                type="button"
                onClick={() => { navigator.clipboard?.writeText(displayId); toast({ title: "ID copiado", description: displayId }); }}
                className="inline-flex items-center px-2 py-0.5 rounded-md border border-border bg-background hover:bg-muted text-[11px] font-mono font-semibold text-foreground transition-colors"
              >
                {displayId}
              </button>
              <div className="inline-flex items-center gap-2 pl-1.5 pr-1 py-1 rounded-md border border-border bg-background shadow-sm">
                <div className="w-6 h-6 rounded bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                  <FileText className="w-3 h-3 text-red-600" />
                </div>
                <div className="flex flex-col min-w-0 leading-tight">
                  <span className="text-[11px] font-semibold text-foreground tabular-nums">{displayId}</span>
                  <span className="text-[9px] tracking-[0.02em] text-muted-foreground font-medium">Gerado automaticamente</span>
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
                      <DialogTitle>Documento {displayId}</DialogTitle>
                      <DialogDescription>Pré-visualização do documento institucional gerado.</DialogDescription>
                    </DialogHeader>
                    <CandidaturaDocPreview candidatura={c} steps={steps} cronologia={cronologia} displayId={displayId} photoIdx={photoIdx} />
                  </DialogContent>
                </Dialog>
                <button
                  type="button"
                  onClick={() => toast({ title: "Documento exportado", description: `${displayId}.pdf` })}
                  className="w-5 h-5 rounded inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title="Exportar"
                >
                  <Download className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Documentos + Linha do Tempo — lado a lado, verticais */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-5 border-b border-border bg-muted/10">
          <div className="md:col-span-2 border border-border rounded-md bg-background overflow-hidden">
            <div className="px-3 py-2 bg-muted/40 border-b border-border flex items-center justify-between">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Documentos
              </h4>
              <span className="text-[10px] tabular-nums text-muted-foreground font-medium">
                {docsEntregues}/{c.documentos.length}
              </span>
            </div>
            <ul className="divide-y divide-border">
              {c.documentos.map((d, i) => (
                <li key={i} className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-foreground">
                  <Check className="w-3 h-3 text-green-600 shrink-0" strokeWidth={3} />
                  <span className="truncate flex-1">{d.nome}</span>
                  <button
                    type="button"
                    onClick={() => toast({ title: "Documento", description: d.nome })}
                    className="w-5 h-5 rounded inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
                    title="Ver documento"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-3 border border-border rounded-md bg-background overflow-hidden">
            <div className="px-3 py-2 bg-muted/40 border-b border-border flex items-center justify-between">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Etapas da Candidatura
              </h4>
              <span className="text-[10px] tabular-nums text-muted-foreground font-medium">
                {cronologia.length}/{cronologia.length}
              </span>
            </div>
            <ul className="divide-y divide-border">
              {cronologia.map((h, i) => (
                <li key={i} className="flex items-center gap-2 px-3 py-1.5 text-[12px]">
                  {h.done ? (
                    <Check className="w-3 h-3 text-green-600 shrink-0" strokeWidth={3} />
                  ) : (
                    <span className="w-3 h-3 rounded-full border border-muted-foreground/40 shrink-0" />
                  )}
                  <span className={cn("truncate", h.done ? "text-foreground" : "text-muted-foreground")}>{h.accao}</span>
                  <span className={cn("ml-auto inline-flex items-center px-1.5 py-0.5 rounded border text-[9px] font-medium uppercase tracking-wide", etapaEstadoStyle[h.estado])}>
                    {h.estado}
                  </span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {new Date(h.data).toLocaleDateString("pt-AO")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Etapas */}
        <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Dados Da Candidatura</h3>
          <div className="flex items-center gap-3">
            <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-green-600" style={{ width: "100%" }} />
            </div>
            <span className="text-xs font-medium text-foreground tabular-nums">{steps.length}/{steps.length}</span>
          </div>
        </div>
        <div className="divide-y divide-border border-b border-border">
          {steps.filter(s => s.title !== "Pagamento").map(s => {
            const Icon = s.icon;
            const open = openStep === s.n;
            return (
              <div key={s.n}>
                <button
                  onClick={() => setOpenStep(open ? null : s.n)}
                  className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-muted/40 transition-colors text-left"
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
                  <Badge variant="outline" className="text-[10px] bg-green-50 text-green-600 border-green-200">Completo</Badge>
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", open && "rotate-180")} />
                </button>
                {open && (
                  <div className="px-6 pb-5 pt-1 bg-muted/20">
                    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 pl-12">
                      {s.rows.map((r, i) => {
                        const fullWidth = ["Endereço", "Escola de origem"].includes(r.label);
                        const breakBefore = ["Encarregado"].includes(r.label);
                        return (
                          <div
                            key={i}
                            className={cn(
                              fullWidth && "sm:col-span-2",
                              breakBefore && "sm:col-start-1 sm:border-t sm:border-border sm:pt-3 sm:mt-1",
                            )}
                          >
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{r.label}</p>
                            <p className="text-sm text-foreground mt-0.5">{r.value}</p>
                          </div>
                        );
                      })}
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
