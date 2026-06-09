import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { candidaturas, estadoColors, estadoLabels } from "@/data/admissoesData";
import {
  ArrowLeft, CheckCircle2, ChevronDown, FileText, CreditCard, Eye, Clock,
  User, MapPin, BookOpen, CalendarDays, ClipboardCheck, Check, GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoRow { label: string; value: string }
interface StepDef {
  n: number;
  title: string;
  sub: string;
  icon: typeof User;
  rows: InfoRow[];
}

// Mock helper — derives a complete-feeling profile from a candidatura
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

export default function GapCandidaturaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const c = candidaturas.find(x => x.id === id);
  const [openStep, setOpenStep] = useState<number | null>(1);

  if (!c) return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
      <p className="text-muted-foreground text-center py-12">Candidatura não encontrada.</p>
    </div>
  );

  const steps = buildSteps(c);
  const docsEntregues = c.documentos.filter(d => d.entregue).length;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      {/* Header — limpo, sem contactos nem tags */}
      <Card className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
              {c.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{c.nome}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Candidatura submetida em {new Date(c.dataSubmissao).toLocaleDateString("pt-AO")}</p>
            </div>
          </div>
          <Badge className={`border-0 ${estadoColors[c.estado]}`}>{estadoLabels[c.estado]}</Badge>
        </div>
      </Card>

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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b bg-muted/30">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" /> Linha do Tempo
            </h3>
          </div>
          <div className="p-5">
            <div className="relative pl-6 space-y-4">
              {c.historico.map((h, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                  {i < c.historico.length - 1 && <div className="absolute -left-[18px] top-4 w-px h-full bg-border" />}
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-[10px] border-0 ${estadoColors[h.para]}`}>{estadoLabels[h.para]}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(h.data).toLocaleDateString("pt-AO")}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">por {h.responsavel}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Documents */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b bg-muted/30">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" /> Documentos ({docsEntregues}/{c.documentos.length})
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
      </div>

      {/* Pagamento */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Pagamento
          </h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Estado</p>
            <Badge variant="outline" className={`text-xs ${c.pagamento.estado === "confirmado" ? "bg-green-50 text-green-600 border-green-200" : "bg-yellow-50 text-yellow-600 border-yellow-200"}`}>
              {c.pagamento.estado === "confirmado" ? "Confirmado" : "Pendente"}
            </Badge>
          </div>
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Referência</p>
            <p className="text-sm font-medium text-foreground font-mono">{c.pagamento.referencia}</p>
          </div>
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Valor</p>
            <p className="text-sm font-medium text-foreground">{c.pagamento.valor.toLocaleString("pt-AO")} Kz</p>
          </div>
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Comprovativo</p>
            {c.pagamento.comprovativo ? (
              <Button variant="outline" size="sm" className="gap-1 text-xs h-7"><Eye className="w-3 h-3" /> Ver</Button>
            ) : (
              <span className="text-sm text-muted-foreground">Não submetido</span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
