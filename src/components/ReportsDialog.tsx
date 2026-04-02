import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, Loader2, Download, Eye, ArrowLeft, BookOpen, Users, TrendingUp, Award } from "lucide-react";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const CURRENT_MONTH = new Date().getMonth();

// Simulate monthly variation based on seed
function vary(base: number, monthIdx: number, range = 5): number {
  const seed = (monthIdx * 7 + 3) % 11;
  const delta = Math.round((seed / 11 - 0.5) * range * 2);
  return Math.max(0, Math.min(100, base + delta));
}
function varyGrade(base: number | null, monthIdx: number): number | null {
  if (base === null) return null;
  const seed = (monthIdx * 5 + 2) % 9;
  const delta = +((seed / 9 - 0.5) * 3).toFixed(1);
  return Math.max(0, Math.min(20, +(base + delta).toFixed(1)));
}

export interface ReportDataRow {
  id: string;
  name: string;
  code?: string;
  email?: string;
  year?: number;
  professor?: string;
  estudantes?: number;
  media: number | null;
  presenca: number;
  taxaEntrega?: number;
  taxaAprovacao?: number;
  taxaReprovacao?: number;
  status?: string;
  // Docente fields
  turmas?: number;
  disciplinas?: number;
  mediaGeral?: number;
  // Estudante fields
  turma?: string;
  tarefasFeitas?: number;
  tarefasTotal?: number;
}

type ReportType = "cadeiras" | "docentes" | "estudantes";

interface ReportsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  reportPrefix: string;
  type: ReportType;
  data: ReportDataRow[];
}

function CadeirasReport({ data, monthIdx }: { data: ReportDataRow[]; monthIdx: number }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="text-left p-2.5 font-medium text-muted-foreground text-xs">Cadeira</th>
            <th className="text-center p-2.5 font-medium text-muted-foreground text-xs">Ano</th>
            <th className="text-left p-2.5 font-medium text-muted-foreground text-xs">Professor</th>
            <th className="text-center p-2.5 font-medium text-muted-foreground text-xs">Alunos</th>
            <th className="text-center p-2.5 font-medium text-muted-foreground text-xs">Presença</th>
            <th className="text-center p-2.5 font-medium text-muted-foreground text-xs">Entrega</th>
            <th className="text-center p-2.5 font-medium text-muted-foreground text-xs">Aprovação</th>
            <th className="text-center p-2.5 font-medium text-muted-foreground text-xs">Média</th>
          </tr>
        </thead>
        <tbody>
          {data.map(d => {
            const pres = vary(d.presenca, monthIdx);
            const entr = vary(d.taxaEntrega ?? 0, monthIdx);
            const aprov = vary(d.taxaAprovacao ?? 0, monthIdx, 8);
            const med = varyGrade(d.media, monthIdx);
            return (
              <tr key={d.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                <td className="p-2.5">
                  <p className="text-xs font-medium text-foreground">{d.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{d.code}</p>
                </td>
                <td className="p-2.5 text-center text-xs text-muted-foreground">{d.year}º</td>
                <td className="p-2.5 text-xs text-muted-foreground">{d.professor}</td>
                <td className="p-2.5 text-center text-xs font-semibold text-foreground">{d.estudantes}</td>
                <td className="p-2.5 text-center">
                  <span className={`text-xs font-semibold ${pres >= 75 ? "text-accent" : "text-destructive"}`}>{pres}%</span>
                </td>
                <td className="p-2.5 text-center">
                  <span className={`text-xs font-semibold ${entr >= 75 ? "text-accent" : "text-destructive"}`}>{entr}%</span>
                </td>
                <td className="p-2.5 text-center">
                  <span className={`text-xs font-semibold ${aprov >= 70 ? "text-accent" : aprov >= 50 ? "text-foreground" : "text-destructive"}`}>{aprov}%</span>
                </td>
                <td className="p-2.5 text-center">
                  <span className={`text-xs font-semibold ${med !== null && med >= 10 ? "text-accent" : "text-destructive"}`}>{med ?? "—"}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DocentesReport({ data, monthIdx }: { data: ReportDataRow[]; monthIdx: number }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="text-left p-2.5 font-medium text-muted-foreground text-xs">Docente</th>
            <th className="text-center p-2.5 font-medium text-muted-foreground text-xs">Cadeiras</th>
            <th className="text-center p-2.5 font-medium text-muted-foreground text-xs">Alunos</th>
            <th className="text-center p-2.5 font-medium text-muted-foreground text-xs">Presença</th>
            <th className="text-center p-2.5 font-medium text-muted-foreground text-xs">Entrega</th>
            <th className="text-center p-2.5 font-medium text-muted-foreground text-xs">Média</th>
          </tr>
        </thead>
        <tbody>
          {data.map(d => {
            const pres = vary(d.presenca, monthIdx);
            const entr = vary(d.taxaEntrega ?? 0, monthIdx);
            const med = varyGrade(d.mediaGeral !== undefined ? d.mediaGeral : d.media, monthIdx);
            return (
              <tr key={d.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                <td className="p-2.5">
                  <p className="text-xs font-medium text-foreground">{d.name}</p>
                  <p className="text-[10px] text-muted-foreground">{d.email}</p>
                </td>
                <td className="p-2.5 text-center text-xs font-semibold text-foreground">{d.disciplinas}</td>
                <td className="p-2.5 text-center text-xs font-semibold text-foreground">{d.estudantes ?? d.estudantes}</td>
                <td className="p-2.5 text-center">
                  <span className={`text-xs font-semibold ${pres >= 75 ? "text-accent" : "text-destructive"}`}>{pres}%</span>
                </td>
                <td className="p-2.5 text-center">
                  <span className={`text-xs font-semibold ${entr >= 80 ? "text-accent" : "text-destructive"}`}>{entr}%</span>
                </td>
                <td className="p-2.5 text-center">
                  <span className={`text-xs font-semibold ${med !== null && med >= 10 ? "text-accent" : "text-destructive"}`}>{med ?? "—"}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EstudantesReport({ data, monthIdx }: { data: ReportDataRow[]; monthIdx: number }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="text-left p-2.5 font-medium text-muted-foreground text-xs">Estudante</th>
            <th className="text-center p-2.5 font-medium text-muted-foreground text-xs">Ano</th>
            <th className="text-center p-2.5 font-medium text-muted-foreground text-xs">Turma</th>
            <th className="text-center p-2.5 font-medium text-muted-foreground text-xs">Presença</th>
            <th className="text-center p-2.5 font-medium text-muted-foreground text-xs">Entrega</th>
            <th className="text-center p-2.5 font-medium text-muted-foreground text-xs">Média</th>
          </tr>
        </thead>
        <tbody>
          {data.map(d => {
            const pres = vary(d.presenca, monthIdx);
            const entr = vary(d.taxaEntrega ?? 0, monthIdx);
            const med = varyGrade(d.media, monthIdx);
            return (
              <tr key={d.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                <td className="p-2.5">
                  <p className="text-xs font-medium text-foreground">{d.name}</p>
                  <p className="text-[10px] text-muted-foreground">{d.email}</p>
                </td>
                <td className="p-2.5 text-center text-xs text-muted-foreground">{d.year}º</td>
                <td className="p-2.5 text-center text-xs text-muted-foreground">{d.turma}</td>
                <td className="p-2.5 text-center">
                  <span className={`text-xs font-semibold ${pres >= 75 ? "text-accent" : "text-destructive"}`}>{pres}%</span>
                </td>
                <td className="p-2.5 text-center">
                  <span className={`text-xs font-semibold ${entr >= 80 ? "text-accent" : "text-destructive"}`}>{entr}%</span>
                </td>
                <td className="p-2.5 text-center">
                  <span className={`text-xs font-semibold ${med !== null && med >= 10 ? "text-accent" : "text-destructive"}`}>{med ?? "—"}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Summary KPIs for the month
function MonthSummary({ data, monthIdx, type }: { data: ReportDataRow[]; monthIdx: number; type: ReportType }) {
  const avgPresenca = Math.round(data.reduce((s, d) => s + vary(d.presenca, monthIdx), 0) / data.length);
  const avgEntrega = Math.round(data.reduce((s, d) => s + vary(d.taxaEntrega ?? 0, monthIdx), 0) / data.length);
  const grades = data.map(d => varyGrade(type === "docentes" && d.mediaGeral !== undefined ? d.mediaGeral : d.media, monthIdx)).filter((g): g is number => g !== null);
  const avgMedia = grades.length ? +(grades.reduce((s, g) => s + g, 0) / grades.length).toFixed(1) : null;

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-lg border border-border p-3 text-center">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Presença</p>
        <p className={`text-xl font-bold ${avgPresenca >= 75 ? "text-accent" : "text-destructive"}`}>{avgPresenca}%</p>
      </div>
      <div className="rounded-lg border border-border p-3 text-center">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Entrega</p>
        <p className={`text-xl font-bold ${avgEntrega >= 75 ? "text-accent" : "text-destructive"}`}>{avgEntrega}%</p>
      </div>
      <div className="rounded-lg border border-border p-3 text-center">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Média</p>
        <p className={`text-xl font-bold ${avgMedia !== null && avgMedia >= 10 ? "text-accent" : "text-destructive"}`}>{avgMedia ?? "—"}/20</p>
      </div>
    </div>
  );
}

export default function ReportsDialog({ open, onOpenChange, title, reportPrefix, type, data }: ReportsDialogProps) {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const handleClose = (val: boolean) => {
    if (!val) setSelectedMonth(null);
    onOpenChange(val);
  };

  // Detail view — professional document style
  if (selectedMonth !== null) {
    const monthName = MONTHS[selectedMonth];
    const avgPresenca = Math.round(data.reduce((s, d) => s + vary(d.presenca, selectedMonth), 0) / data.length);
    const avgEntrega = Math.round(data.reduce((s, d) => s + vary(d.taxaEntrega ?? 0, selectedMonth), 0) / data.length);
    const grades = data.map(d => varyGrade(type === "docentes" && d.mediaGeral !== undefined ? d.mediaGeral : d.media, selectedMonth)).filter((g): g is number => g !== null);
    const avgMedia = grades.length ? +(grades.reduce((s, g) => s + g, 0) / grades.length).toFixed(1) : null;
    const typeLabel = type === "cadeiras" ? "Cadeiras" : type === "docentes" ? "Docentes" : "Estudantes";
    const approvedCount = type === "cadeiras"
      ? data.filter(d => vary(d.taxaAprovacao ?? 0, selectedMonth) >= 70).length
      : data.filter(d => varyGrade(type === "docentes" && d.mediaGeral !== undefined ? d.mediaGeral : d.media, selectedMonth) !== null && (varyGrade(type === "docentes" && d.mediaGeral !== undefined ? d.mediaGeral : d.media, selectedMonth) ?? 0) >= 10).length;
    const atRiskCount = data.filter(d => vary(d.presenca, selectedMonth) < 75).length;

    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-0">
          {/* Floating back button */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-3 flex items-center justify-between">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => setSelectedMonth(null)}>
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Printer className="w-3.5 h-3.5" /> Imprimir
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Download className="w-3.5 h-3.5" /> Exportar PDF
              </Button>
            </div>
          </div>

          {/* Document */}
          <div className="bg-muted/30 p-6 lg:p-10">
            <div className="bg-background rounded-lg shadow-sm border border-border max-w-[800px] mx-auto">
              {/* Document header — institution style */}
              <div className="border-b-2 border-primary px-8 pt-8 pb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em]">Universidade Privada de Angola</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">Faculdade de Engenharia e Tecnologias</p>
                    <p className="text-[9px] text-muted-foreground">Curso de Arquitectura</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-muted-foreground">Ref: RPT/{selectedMonth + 1 < 10 ? `0${selectedMonth + 1}` : selectedMonth + 1}/2025</p>
                    <p className="text-[9px] text-muted-foreground">Data: {selectedMonth + 1 < 10 ? `0${selectedMonth + 1}` : selectedMonth + 1}/04/2025</p>
                  </div>
                </div>

                <div className="mt-5">
                  <h1 className="text-lg font-bold text-foreground">{reportPrefix}</h1>
                  <p className="text-sm text-muted-foreground mt-1">{monthName} 2025 · Ano Lectivo 2024/2025</p>
                </div>
              </div>

              {/* Executive summary */}
              <div className="px-8 py-6 border-b border-border">
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-primary" />
                  Resumo Executivo
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  Este relatório apresenta os indicadores de desempenho referentes ao mês de {monthName.toLowerCase()} de 2025,
                  abrangendo {data.length} {typeLabel.toLowerCase()} do curso. A análise contempla métricas de presença,
                  taxa de entrega e desempenho académico geral.
                </p>

                {/* KPI grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="rounded-md border border-border p-3">
                    <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Total {typeLabel}</p>
                    <p className="text-xl font-bold text-foreground mt-1">{data.length}</p>
                  </div>
                  <div className="rounded-md border border-border p-3">
                    <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Presença Média</p>
                    <p className={`text-xl font-bold mt-1 ${avgPresenca >= 75 ? "text-accent" : "text-destructive"}`}>{avgPresenca}%</p>
                  </div>
                  <div className="rounded-md border border-border p-3">
                    <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Taxa de Entrega</p>
                    <p className={`text-xl font-bold mt-1 ${avgEntrega >= 75 ? "text-accent" : "text-destructive"}`}>{avgEntrega}%</p>
                  </div>
                  <div className="rounded-md border border-border p-3">
                    <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Média Geral</p>
                    <p className={`text-xl font-bold mt-1 ${avgMedia !== null && avgMedia >= 10 ? "text-accent" : "text-destructive"}`}>{avgMedia ?? "—"}<span className="text-xs font-normal text-muted-foreground">/20</span></p>
                  </div>
                </div>

                {/* Highlight badges */}
                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <span className="text-muted-foreground">Acima da média: <span className="font-semibold text-accent">{approvedCount}</span></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <div className="w-2 h-2 rounded-full bg-destructive" />
                    <span className="text-muted-foreground">Em risco (presença &lt;75%): <span className="font-semibold text-destructive">{atRiskCount}</span></span>
                  </div>
                </div>
              </div>

              {/* Data table section */}
              <div className="px-8 py-6 border-b border-border">
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-primary" />
                  Dados Detalhados — {monthName}
                </h2>

                {type === "cadeiras" && <CadeirasReport data={data} monthIdx={selectedMonth} />}
                {type === "docentes" && <DocentesReport data={data} monthIdx={selectedMonth} />}
                {type === "estudantes" && <EstudantesReport data={data} monthIdx={selectedMonth} />}
              </div>

              {/* Observations */}
              <div className="px-8 py-6 border-b border-border">
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-primary" />
                  Observações
                </h2>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {atRiskCount > 0 && (
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                      <span>{atRiskCount} {typeLabel.toLowerCase()} apresentam taxa de presença inferior a 75%, requerendo atenção imediata.</span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <BarChart2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span>A média geral de {avgMedia ?? "—"}/20 encontra-se {avgMedia !== null && avgMedia >= 10 ? "acima" : "abaixo"} do limiar de aprovação.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                    <span>Taxa de entrega média de {avgEntrega}% — {avgEntrega >= 80 ? "dentro dos padrões esperados" : "abaixo do mínimo recomendado de 80%"}.</span>
                  </li>
                </ul>
              </div>

              {/* Footer */}
              <div className="px-8 py-4 bg-muted/20 rounded-b-lg">
                <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                  <span>Documento gerado automaticamente · UPRA — Sistema de Gestão Académica</span>
                  <span>Página 1 de 1</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Month list view
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <FileText className="w-5 h-5 text-primary" />
            Relatórios — {title}
          </DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted-foreground">Ano Lectivo 2024/2025 · Relatórios mensais</p>

        <div className="rounded-lg border border-border overflow-hidden mt-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Mês</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Relatório</th>
                <th className="text-center p-3 font-medium text-muted-foreground text-xs">Estado</th>
                <th className="text-center p-3 font-medium text-muted-foreground text-xs">Acção</th>
              </tr>
            </thead>
            <tbody>
              {MONTHS.map((month, idx) => {
                const isAvailable = idx <= CURRENT_MONTH;
                return (
                  <tr key={month} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-3 text-foreground font-medium">{month}</td>
                    <td className="p-3 text-muted-foreground text-xs">{reportPrefix} — {month}</td>
                    <td className="p-3 text-center">
                      {isAvailable ? (
                        <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 text-[10px] gap-1">
                          <CheckCircle className="w-3 h-3" /> Gerado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[10px] gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Em Progresso
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {isAvailable ? (
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-primary hover:text-primary hover:bg-primary/10" onClick={() => setSelectedMonth(idx)}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted">
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
