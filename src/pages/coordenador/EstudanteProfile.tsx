import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { coordEstudantes, coordDisciplinas, coordCursoInfo, coordTurmas } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  ArrowLeft, Mail, MessageCircle, BookOpen,
  Award, Users, Phone, MapPin, UserCheck, Calendar, GraduationCap,
  CheckCircle, ClipboardList, TrendingUp, Wallet, FileText, Printer, Download,
  ChevronRight, CreditCard, AlertCircle, Hash, Building2, IdCard,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import placeholderStudent from "@/assets/placeholder-student.jpg";

const statusConfig = {
  excelente: { label: "Excelente", bg: "bg-accent/10 text-accent border-accent/30" },
  normal: { label: "Normal", bg: "bg-muted text-muted-foreground border-border" },
  risco: { label: "Em Risco", bg: "bg-destructive/10 text-destructive border-destructive/30" },
};

// ---- Mock financeiro (consistente por id)
function getFinanceiro(id: string, name: string) {
  const seed = id.charCodeAt(id.length - 1) % 4;
  const propinaMensal = 45000;
  const mesesPagos = 8 + (seed % 3); // 8..10
  const mesesTotal = 10;
  const emDivida = mesesTotal - mesesPagos;
  const valorDivida = emDivida * propinaMensal;
  const estado: "regularizado" | "por_regularizar" | "atencao" =
    emDivida === 0 ? "regularizado" : emDivida >= 2 ? "por_regularizar" : "atencao";
  return {
    matricula: `MAT-${id.toUpperCase()}-2024`,
    plano: "Mensal · Ano Letivo 2024/25",
    propinaMensal,
    mesesPagos,
    mesesTotal,
    emDivida,
    valorDivida,
    valorPago: mesesPagos * propinaMensal,
    proximaFatura: { mes: "Junho 2026", valor: propinaMensal, venc: "05/06/2026" },
    ultimoPagamento: { mes: "Maio 2026", valor: propinaMensal, data: "03/05/2026", metodo: "Transferência" },
    estado,
    titular: name,
    iban: "AO06 0040 0000 1234 5678 9012 3",
  };
}

const financeStateMap = {
  regularizado: { label: "Regularizado", cls: "bg-accent/15 text-accent border-accent/30" },
  atencao: { label: "Atenção", cls: "bg-muted text-muted-foreground border-border" },
  por_regularizar: { label: "Por Regularizar", cls: "bg-destructive/15 text-destructive border-destructive/30" },
};

const fmtAOA = (n: number) => new Intl.NumberFormat("pt-PT", { style: "currency", currency: "AOA", maximumFractionDigits: 0 }).format(n);

export default function CoordenadorEstudanteProfile() {
  const { estudanteId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reportType, setReportType] = useState<null | "academico" | "financeiro">(null);
  const [reportMenuOpen, setReportMenuOpen] = useState(false);

  const student = coordEstudantes.find(s => s.id === estudanteId);

  const fin = useMemo(() => student ? getFinanceiro(student.id, student.name) : null, [student]);

  if (!student || !fin) {
    return (
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
        <p className="text-muted-foreground text-center py-12">Estudante não encontrado.</p>
      </div>
    );
  }

  const sc = statusConfig[student.status];
  const fs = financeStateMap[fin.estado];
  const yearDiscs = coordDisciplinas.filter(d => d.year === student.year);
  const studentTurmas = coordTurmas.filter(t => t.year === student.year);
  const finPct = Math.round((fin.mesesPagos / fin.mesesTotal) * 100);

  const openReport = (t: "academico" | "financeiro") => { setReportType(t); setReportMenuOpen(false); };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 -ml-2">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      {/* Identity header — refined */}
      <Card className="overflow-hidden p-0">
        <div className="grid lg:grid-cols-[1.6fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-border">
          <div className="p-6">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-full bg-muted overflow-hidden shrink-0 ring-2 ring-border">
                <img src={placeholderStudent} alt={student.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">Perfil do Estudante</p>
                <h1 className="text-2xl font-bold text-foreground leading-tight mt-1">{student.name}</h1>
                <p className="text-xs text-muted-foreground mt-1.5">
                  <Link to="/coordenador/curso" className="hover:text-foreground transition-colors">{coordCursoInfo.code} · {coordCursoInfo.name}</Link>
                  <span className="mx-1.5 text-muted-foreground/40">·</span>
                  {student.year}º Ano · Turma {student.turma}
                </p>
                <div className="flex items-center gap-1.5 flex-wrap mt-3">
                  <Badge variant="outline" className={cn("text-[10px]", sc.bg)}>{sc.label}</Badge>
                  <Badge variant="outline" className={cn("text-[10px]", fs.cls)}>
                    <Wallet className="w-2.5 h-2.5 mr-1" /> {fs.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7">
                    <MessageCircle className="w-3.5 h-3.5" /> Chat
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 p-6 grid grid-cols-2 gap-4 content-center">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Média Geral</p>
              <p className={cn("text-2xl font-bold tabular-nums mt-1", student.media !== null && student.media >= 10 ? "text-accent" : "text-destructive")}>
                {student.media ?? "—"}<span className="text-sm text-muted-foreground font-normal">/20</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Presença</p>
              <p className={cn("text-2xl font-bold tabular-nums mt-1", student.presenca >= 75 ? "text-accent" : "text-destructive")}>
                {student.presenca}<span className="text-sm text-muted-foreground font-normal">%</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Taxa de Entrega</p>
              <p className={cn("text-2xl font-bold tabular-nums mt-1", student.taxaEntrega >= 80 ? "text-accent" : "text-destructive")}>
                {student.taxaEntrega}<span className="text-sm text-muted-foreground font-normal">%</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Avaliações</p>
              <p className="text-2xl font-bold tabular-nums text-foreground mt-1">
                {student.avaliacoesFeitas}<span className="text-sm text-muted-foreground font-normal">/{student.avaliacoesTotal}</span>
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <TabsList className="bg-muted/40">
            <TabsTrigger value="overview" className="text-xs">Visão Geral</TabsTrigger>
            <TabsTrigger value="academico" className="text-xs">Académico</TabsTrigger>
            <TabsTrigger value="financeiro" className="text-xs">Financeiro</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="m-0 p-0">
            <Popover open={reportMenuOpen} onOpenChange={setReportMenuOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                  <FileText className="w-3.5 h-3.5" /> Ver Relatórios
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 p-0 overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <p className="text-xs font-semibold text-foreground">Relatórios do Estudante</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Documentos disponíveis para impressão</p>
                </div>
                <div className="p-1.5">
                  {[
                    { id: "academico" as const, label: "Relatório Académico", desc: "Notas, presença, entrega e cadeiras", icon: <GraduationCap className="w-4 h-4" /> },
                    { id: "financeiro" as const, label: "Relatório Financeiro", desc: "Pagamentos, dívida e plano de propinas", icon: <Wallet className="w-4 h-4" /> },
                  ].map(r => (
                    <button
                      key={r.id}
                      onClick={() => openReport(r.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">{r.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{r.label}</p>
                        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{r.desc}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </TabsContent>
          <TabsContent value="academico" className="m-0 p-0">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={() => openReport("academico")}>
              <FileText className="w-3.5 h-3.5" /> Ver Relatório Académico
            </Button>
          </TabsContent>
          <TabsContent value="financeiro" className="m-0 p-0">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={() => openReport("financeiro")}>
              <FileText className="w-3.5 h-3.5" /> Ver Relatório Financeiro
            </Button>
          </TabsContent>
        </div>

        {/* === Visão Geral === */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <SectionCard title="Informações Pessoais" icon={<UserCheck className="w-4 h-4" />}>
              <InfoRow label="Email" value={student.email} icon={<Mail className="w-4 h-4 text-primary" />} />
              <InfoRow label="Telefone" value="+244 923 456 789" icon={<Phone className="w-4 h-4 text-primary" />} />
              <InfoRow label="Data de Nascimento" value="15/03/2001" icon={<Calendar className="w-4 h-4 text-primary" />} />
              <InfoRow label="Morada" value="Rua da Samba, Nº 45, Luanda" icon={<MapPin className="w-4 h-4 text-primary" />} />
              <InfoRow label="Encarregado de Educação" value="Maria Santos" icon={<UserCheck className="w-4 h-4 text-primary" />} />
              <InfoRow label="Nº do Encarregado" value="+244 912 345 678" icon={<Phone className="w-4 h-4 text-primary" />} />
            </SectionCard>

            <SectionCard title="Informações Académicas" icon={<GraduationCap className="w-4 h-4" />}>
              <InfoRow label="Curso" value={coordCursoInfo.name} icon={<GraduationCap className="w-4 h-4 text-primary" />} />
              <InfoRow label="Faculdade" value={coordCursoInfo.faculty} icon={<Building2 className="w-4 h-4 text-primary" />} />
              <InfoRow label="Ano Curricular" value={`${student.year}º Ano`} icon={<Calendar className="w-4 h-4 text-primary" />} />
              <InfoRow label="Turma" value={`Turma ${student.turma}`} icon={<Users className="w-4 h-4 text-primary" />} />
              <InfoRow label="Cadeiras Inscritas" value={String(yearDiscs.length)} icon={<BookOpen className="w-4 h-4 text-primary" />} />
              <InfoRow label="Nº de Matrícula" value={fin.matricula} icon={<IdCard className="w-4 h-4 text-primary" />} />
            </SectionCard>
          </div>

          {/* Estado Financeiro — destaque */}
          <Card className="overflow-hidden p-0">
            <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" /> Estado Financeiro
              </h3>
              <Badge variant="outline" className={cn("text-[10px]", fs.cls)}>{fs.label}</Badge>
            </div>
            <div className="grid sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
              <FinKpi label="Valor Pago" value={fmtAOA(fin.valorPago)} sub={`${fin.mesesPagos}/${fin.mesesTotal} meses`} tone="accent" />
              <FinKpi label="Por Regularizar" value={fmtAOA(fin.valorDivida)} sub={fin.emDivida > 0 ? `${fin.emDivida} meses pendentes` : "Tudo em dia"} tone={fin.valorDivida > 0 ? "destructive" : "neutral"} />
              <FinKpi label="Propina Mensal" value={fmtAOA(fin.propinaMensal)} sub={fin.plano} tone="neutral" />
              <FinKpi label="Próxima Fatura" value={fmtAOA(fin.proximaFatura.valor)} sub={`Vence ${fin.proximaFatura.venc}`} tone="neutral" />
            </div>
            <div className="px-4 py-3 border-t border-border bg-muted/20">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Plano de Pagamentos · Ano Letivo</span>
                <span className="text-xs font-semibold text-foreground tabular-nums">{finPct}% concluído</span>
              </div>
              <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className={cn("h-full", fin.estado === "por_regularizar" ? "bg-destructive" : fin.estado === "atencao" ? "bg-muted-foreground/60" : "bg-accent")} style={{ width: `${finPct}%` }} />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* === Académico === */}
        <TabsContent value="academico" className="space-y-4">
          <Card className="overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> Cadeiras do {student.year}º Ano
                <span className="ml-auto text-[11px] text-muted-foreground font-normal">{yearDiscs.length} cadeiras</span>
              </h3>
            </div>
            <div className="divide-y divide-border">
              {yearDiscs.length > 0 ? yearDiscs.map(disc => (
                <div key={disc.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{disc.name}</p>
                      <Badge variant="outline" className="text-[10px]">{disc.code}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{disc.professor} · {disc.diasAula} · {disc.location}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs shrink-0">
                    <Metric label="Presença" value={`${disc.presenca}%`} ok={disc.presenca >= 75} />
                    <Metric label="Média" value={disc.media ?? "—"} ok={disc.media !== null && disc.media >= 10} />
                    <Metric label="Aprovação" value={`${disc.taxaAprovacao}%`} ok={disc.taxaAprovacao >= 70} />
                  </div>
                </div>
              )) : (
                <div className="px-5 py-8 text-center text-muted-foreground text-sm">Nenhuma cadeira encontrada.</div>
              )}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" /> Resumo de Desempenho
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
              <FinKpi label="Média Geral" value={`${student.media ?? "—"}/20`} sub="Acumulada" tone={student.media !== null && student.media >= 10 ? "accent" : "destructive"} />
              <FinKpi label="Presença" value={`${student.presenca}%`} sub="Mínimo 75%" tone={student.presenca >= 75 ? "accent" : "destructive"} />
              <FinKpi label="Taxa de Entrega" value={`${student.taxaEntrega}%`} sub={`${student.tarefasFeitas}/${student.tarefasTotal} tarefas`} tone={student.taxaEntrega >= 80 ? "accent" : "destructive"} />
              <FinKpi label="Avaliações" value={`${student.avaliacoesFeitas}/${student.avaliacoesTotal}`} sub="Realizadas" tone="neutral" />
            </div>
          </Card>
        </TabsContent>

        {/* === Financeiro === */}
        <TabsContent value="financeiro" className="space-y-4">
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
            <Card className="overflow-hidden p-0">
              <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-primary" /> Resumo Financeiro
                </h3>
                <Badge variant="outline" className={cn("text-[10px]", fs.cls)}>{fs.label}</Badge>
              </div>
              <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
                <FinKpi label="Valor Pago" value={fmtAOA(fin.valorPago)} sub={`${fin.mesesPagos}/${fin.mesesTotal} meses`} tone="accent" />
                <FinKpi label="Por Regularizar" value={fmtAOA(fin.valorDivida)} sub={fin.emDivida > 0 ? `${fin.emDivida} meses` : "Em dia"} tone={fin.valorDivida > 0 ? "destructive" : "neutral"} />
              </div>
              <div className="px-4 py-3 border-t border-border bg-muted/20">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Plano de Pagamentos</span>
                  <span className="text-xs font-semibold text-foreground tabular-nums">{finPct}%</span>
                </div>
                <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className={cn("h-full", fin.estado === "por_regularizar" ? "bg-destructive" : fin.estado === "atencao" ? "bg-muted-foreground/60" : "bg-accent")} style={{ width: `${finPct}%` }} />
                </div>
              </div>
            </Card>

            <SectionCard title="Dados do Plano" icon={<CreditCard className="w-4 h-4" />}>
              <InfoRow label="Matrícula" value={fin.matricula} icon={<Hash className="w-4 h-4 text-primary" />} />
              <InfoRow label="Plano" value={fin.plano} icon={<Calendar className="w-4 h-4 text-primary" />} />
              <InfoRow label="Propina Mensal" value={fmtAOA(fin.propinaMensal)} icon={<Wallet className="w-4 h-4 text-primary" />} />
              <InfoRow label="Titular" value={fin.titular} icon={<UserCheck className="w-4 h-4 text-primary" />} />
              <InfoRow label="IBAN Conta" value={fin.iban} icon={<CreditCard className="w-4 h-4 text-primary" />} />
            </SectionCard>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <SectionCard title="Próxima Fatura" icon={<AlertCircle className="w-4 h-4" />}>
              <InfoRow label="Referência" value={fin.proximaFatura.mes} icon={<Calendar className="w-4 h-4 text-primary" />} />
              <InfoRow label="Valor" value={fmtAOA(fin.proximaFatura.valor)} icon={<Wallet className="w-4 h-4 text-primary" />} />
              <InfoRow label="Data de Vencimento" value={fin.proximaFatura.venc} icon={<Calendar className="w-4 h-4 text-primary" />} />
            </SectionCard>

            <SectionCard title="Último Pagamento" icon={<CheckCircle className="w-4 h-4" />}>
              <InfoRow label="Referência" value={fin.ultimoPagamento.mes} icon={<Calendar className="w-4 h-4 text-primary" />} />
              <InfoRow label="Valor" value={fmtAOA(fin.ultimoPagamento.valor)} icon={<Wallet className="w-4 h-4 text-primary" />} />
              <InfoRow label="Data de Pagamento" value={fin.ultimoPagamento.data} icon={<Calendar className="w-4 h-4 text-primary" />} />
              <InfoRow label="Método" value={fin.ultimoPagamento.metodo} icon={<CreditCard className="w-4 h-4 text-primary" />} />
            </SectionCard>
          </div>
        </TabsContent>
      </Tabs>

      {/* Report dialog */}
      <Dialog open={reportType !== null} onOpenChange={(o) => !o && setReportType(null)}>
        <DialogContent className="max-w-5xl p-0 h-[90vh] flex flex-col">
          {reportType && (
            <ReportDocPreview
              type={reportType}
              student={student}
              fin={fin}
              cadeiras={yearDiscs}
              onPrint={() => window.print()}
              onDownload={() => toast({ title: "Documento exportado", description: `${reportType === "academico" ? "Relatorio-Academico" : "Relatorio-Financeiro"}-${student.id.toUpperCase()}.pdf` })}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------- Subcomponents ---------- */
function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b bg-muted/30">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">{icon}{title}</h3>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </Card>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">{icon}</div>
        <p className="text-sm text-muted-foreground truncate">{label}</p>
      </div>
      <p className="text-sm font-semibold text-foreground text-right truncate">{value}</p>
    </div>
  );
}

function FinKpi({ label, value, sub, tone }: { label: string; value: string | number; sub?: string; tone: "accent" | "destructive" | "neutral" }) {
  const cls = tone === "accent" ? "text-accent" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <div className="p-4">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
      <p className={cn("text-xl font-bold tabular-nums mt-1.5", cls)}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function Metric({ label, value, ok }: { label: string; value: string | number; ok: boolean }) {
  return (
    <div className="text-center">
      <p className={cn("font-semibold", ok ? "text-accent" : "text-destructive")}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

/* ---------- Printable doc ---------- */
function ReportDocPreview({
  type, student, fin, cadeiras, onPrint, onDownload,
}: {
  type: "academico" | "financeiro";
  student: typeof coordEstudantes[number];
  fin: ReturnType<typeof getFinanceiro>;
  cadeiras: typeof coordDisciplinas;
  onPrint: () => void;
  onDownload: () => void;
}) {
  const title = type === "academico" ? "Relatório Académico" : "Relatório Financeiro";
  const refId = `${type === "academico" ? "ACAD" : "FIN"}-${student.id.toUpperCase()}`;
  const today = new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="flex flex-col h-full min-h-0 bg-muted/30">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-background shrink-0 print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-semibold text-muted-foreground">{refId}</span>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <span className="text-[11px] text-muted-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5" onClick={onPrint}><Printer className="w-3 h-3" /> Imprimir</Button>
          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5" onClick={onDownload}><Download className="w-3 h-3" /> Descarregar</Button>
        </div>
      </div>

      {/* A4 */}
      <div className="flex-1 min-h-0 overflow-y-auto py-6 px-4">
        <div className="mx-auto bg-white shadow-md border border-border print:shadow-none print:border-0 text-foreground" style={{ width: "210mm", minHeight: "297mm" }}>
          {/* Header */}
          <div className="px-12 pt-9 pb-4">
            <div className="flex items-start justify-between gap-6 pb-3 border-b border-foreground">
              <div>
                <p className="text-[8px] uppercase tracking-[0.24em] text-foreground/60 font-semibold">Universidade Privada</p>
                <h1 className="text-[15px] font-bold tracking-tight leading-tight mt-0.5">{type === "academico" ? "Direcção Académica" : "Direcção Financeira"}</h1>
                <p className="text-[9px] text-foreground/60 mt-0.5">{coordCursoInfo.faculty} · {coordCursoInfo.name}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] uppercase tracking-[0.24em] text-foreground/60 font-semibold">Documento</p>
                <p className="text-[11px] font-mono font-bold mt-0.5">{refId}</p>
                <p className="text-[9px] text-foreground/60 mt-0.5">Emitido em {today}</p>
              </div>
            </div>
            <h2 className="text-[20px] font-bold tracking-tight mt-5">{title}</h2>
            <p className="text-[10px] text-foreground/60 mt-1">Documento oficial referente ao estudante abaixo identificado.</p>
          </div>

          {/* Estudante */}
          <div className="px-12 py-4">
            <p className="text-[9px] uppercase tracking-[0.18em] text-foreground/50 font-semibold mb-2">Identificação do Estudante</p>
            <div className="grid grid-cols-2 gap-y-1.5 gap-x-6 text-[11px]">
              <DocLine k="Nome" v={student.name} />
              <DocLine k="Matrícula" v={fin.matricula} />
              <DocLine k="Email" v={student.email} />
              <DocLine k="Curso" v={coordCursoInfo.name} />
              <DocLine k="Ano · Turma" v={`${student.year}º Ano · Turma ${student.turma}`} />
              <DocLine k="Faculdade" v={coordCursoInfo.faculty} />
            </div>
          </div>

          {type === "academico" ? (
            <>
              <div className="px-12 py-4">
                <p className="text-[9px] uppercase tracking-[0.18em] text-foreground/50 font-semibold mb-2">Síntese de Desempenho</p>
                <div className="grid grid-cols-4 gap-3 text-[11px]">
                  <DocStat k="Média" v={`${student.media ?? "—"}/20`} />
                  <DocStat k="Presença" v={`${student.presenca}%`} />
                  <DocStat k="Taxa Entrega" v={`${student.taxaEntrega}%`} />
                  <DocStat k="Avaliações" v={`${student.avaliacoesFeitas}/${student.avaliacoesTotal}`} />
                </div>
              </div>
              <div className="px-12 py-4">
                <p className="text-[9px] uppercase tracking-[0.18em] text-foreground/50 font-semibold mb-2">Cadeiras Inscritas</p>
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="border-b border-foreground/30 text-foreground/60">
                      <th className="text-left py-1.5 font-semibold">Cadeira</th>
                      <th className="text-left py-1.5 font-semibold">Docente</th>
                      <th className="text-center py-1.5 font-semibold">Presença</th>
                      <th className="text-center py-1.5 font-semibold">Média</th>
                      <th className="text-center py-1.5 font-semibold">Aprovação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cadeiras.map(c => (
                      <tr key={c.id} className="border-b border-foreground/10">
                        <td className="py-1.5">{c.name} <span className="text-foreground/50">({c.code})</span></td>
                        <td className="py-1.5">{c.professor}</td>
                        <td className="py-1.5 text-center tabular-nums">{c.presenca}%</td>
                        <td className="py-1.5 text-center tabular-nums">{c.media ?? "—"}</td>
                        <td className="py-1.5 text-center tabular-nums">{c.taxaAprovacao}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <div className="px-12 py-4">
                <p className="text-[9px] uppercase tracking-[0.18em] text-foreground/50 font-semibold mb-2">Síntese Financeira</p>
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-6 text-[11px]">
                  <DocLine k="Plano" v={fin.plano} />
                  <DocLine k="Propina Mensal" v={fmtAOA(fin.propinaMensal)} />
                  <DocLine k="Meses Pagos" v={`${fin.mesesPagos} / ${fin.mesesTotal}`} />
                  <DocLine k="Valor Pago" v={fmtAOA(fin.valorPago)} />
                  <DocLine k="Por Regularizar" v={fmtAOA(fin.valorDivida)} />
                  <DocLine k="Estado" v={fin.estado === "regularizado" ? "Regularizado" : fin.estado === "atencao" ? "Atenção" : "Por Regularizar"} />
                </div>
              </div>
              <div className="px-12 py-4">
                <p className="text-[9px] uppercase tracking-[0.18em] text-foreground/50 font-semibold mb-2">Movimentos Recentes</p>
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="border-b border-foreground/30 text-foreground/60">
                      <th className="text-left py-1.5 font-semibold">Data</th>
                      <th className="text-left py-1.5 font-semibold">Descrição</th>
                      <th className="text-left py-1.5 font-semibold">Método</th>
                      <th className="text-right py-1.5 font-semibold">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-foreground/10">
                      <td className="py-1.5">{fin.ultimoPagamento.data}</td>
                      <td className="py-1.5">Propina · {fin.ultimoPagamento.mes}</td>
                      <td className="py-1.5">{fin.ultimoPagamento.metodo}</td>
                      <td className="py-1.5 text-right tabular-nums">{fmtAOA(fin.ultimoPagamento.valor)}</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="py-1.5 text-foreground/60">{fin.proximaFatura.venc}</td>
                      <td className="py-1.5 text-foreground/60">Próxima fatura · {fin.proximaFatura.mes}</td>
                      <td className="py-1.5 text-foreground/60">—</td>
                      <td className="py-1.5 text-right tabular-nums text-foreground/60">{fmtAOA(fin.proximaFatura.valor)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="px-12 pt-6 pb-9 mt-4 border-t border-foreground/20">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-[8px] uppercase tracking-[0.18em] text-foreground/50 font-semibold">Coordenador do Curso</p>
                <p className="text-[10px] font-semibold mt-3">{coordCursoInfo.coordinator ?? "Coordenação do Curso"}</p>
                <div className="w-44 border-t border-foreground/40 mt-6" />
                <p className="text-[8px] text-foreground/60 mt-1">Assinatura</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] text-foreground/50">{coordCursoInfo.code} · Documento gerado automaticamente</p>
                <p className="text-[8px] text-foreground/50 mt-0.5">{refId} · {today}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocLine({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-foreground/50 min-w-[110px]">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
function DocStat({ k, v }: { k: string; v: string }) {
  return (
    <div className="border border-foreground/15 rounded p-2">
      <p className="text-[8px] uppercase tracking-wider text-foreground/50 font-semibold">{k}</p>
      <p className="text-[14px] font-bold tabular-nums mt-0.5">{v}</p>
    </div>
  );
}
