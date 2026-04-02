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

  // Detail view for a selected month
  if (selectedMonth !== null) {
    const monthName = MONTHS[selectedMonth];
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <FileText className="w-5 h-5 text-primary" />
              {reportPrefix} — {monthName}
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => setSelectedMonth(null)}>
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar aos Relatórios
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] gap-1 bg-accent/10 text-accent border-accent/30">
                <CheckCircle className="w-3 h-3" /> Gerado
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                Ano Lectivo 2024/2025
              </Badge>
            </div>
          </div>

          <MonthSummary data={data} monthIdx={selectedMonth} type={type} />

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {type === "cadeiras" ? `${data.length} Cadeiras` : type === "docentes" ? `${data.length} Docentes` : `${data.length} Estudantes`}
            </p>
            {type === "cadeiras" && <CadeirasReport data={data} monthIdx={selectedMonth} />}
            {type === "docentes" && <DocentesReport data={data} monthIdx={selectedMonth} />}
            {type === "estudantes" && <EstudantesReport data={data} monthIdx={selectedMonth} />}
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" /> Exportar Relatório
            </Button>
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
