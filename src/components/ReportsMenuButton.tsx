import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { FileText, ChevronRight, CalendarDays, BarChart3, TrendingUp, Users, BookOpen, Award, Loader2 } from "lucide-react";
import ReportsDialog, { ReportDataRow } from "@/components/ReportsDialog";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const CURRENT_MONTH = new Date().getMonth();

type ReportType = "cadeiras" | "docentes" | "estudantes";

interface ReportCategory {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  type: ReportType;
  prefix: string;
}

interface ReportsMenuButtonProps {
  categories: ReportCategory[];
  data: ReportDataRow[];
}

// Pre-built category configs for each page
export const cadeirasCategories: ReportCategory[] = [
  { id: "desempenho", label: "Desempenho Académico", description: "Presença, entrega e médias por cadeira", icon: <BarChart3 className="w-4 h-4" />, type: "cadeiras", prefix: "Relatório de Desempenho — Cadeiras" },
  { id: "aprovacao", label: "Taxas de Aprovação", description: "Aprovações e reprovações por disciplina", icon: <TrendingUp className="w-4 h-4" />, type: "cadeiras", prefix: "Relatório de Aprovação — Cadeiras" },
  { id: "geral", label: "Relatório Geral", description: "Visão completa de todas as cadeiras", icon: <BookOpen className="w-4 h-4" />, type: "cadeiras", prefix: "Relatório Geral — Cadeiras do Curso" },
];

export const docentesCategories: ReportCategory[] = [
  { id: "desempenho", label: "Desempenho Docente", description: "Avaliação de presença e entrega dos docentes", icon: <BarChart3 className="w-4 h-4" />, type: "docentes", prefix: "Relatório de Desempenho — Docentes" },
  { id: "turmas", label: "Carga e Turmas", description: "Distribuição de turmas e disciplinas", icon: <Users className="w-4 h-4" />, type: "docentes", prefix: "Relatório de Turmas — Docentes" },
  { id: "geral", label: "Relatório Geral", description: "Visão completa do corpo docente", icon: <BookOpen className="w-4 h-4" />, type: "docentes", prefix: "Relatório Geral — Docentes do Curso" },
];

export const estudantesCategories: ReportCategory[] = [
  { id: "desempenho", label: "Desempenho Estudantil", description: "Médias, presença e entrega dos estudantes", icon: <BarChart3 className="w-4 h-4" />, type: "estudantes", prefix: "Relatório de Desempenho — Estudantes" },
  { id: "risco", label: "Estudantes em Risco", description: "Identificação de alunos abaixo dos limiares", icon: <TrendingUp className="w-4 h-4" />, type: "estudantes", prefix: "Relatório de Risco — Estudantes" },
  { id: "geral", label: "Relatório Geral", description: "Visão completa dos estudantes do curso", icon: <BookOpen className="w-4 h-4" />, type: "estudantes", prefix: "Relatório Geral — Estudantes do Curso" },
];

export const notasCategories: ReportCategory[] = [
  { id: "notas", label: "Notas por Turma", description: "Médias e avaliações organizadas por turma", icon: <Award className="w-4 h-4" />, type: "cadeiras", prefix: "Relatório de Notas — Turmas do Curso" },
  { id: "aprovacao", label: "Taxas de Aprovação", description: "Aprovações e reprovações por avaliação", icon: <TrendingUp className="w-4 h-4" />, type: "cadeiras", prefix: "Relatório de Aprovação — Notas do Curso" },
  { id: "geral", label: "Relatório Geral", description: "Visão completa das notas do curso", icon: <BookOpen className="w-4 h-4" />, type: "cadeiras", prefix: "Relatório Geral — Notas do Curso" },
];

export default function ReportsMenuButton({ categories, data }: ReportsMenuButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [showReport, setShowReport] = useState(false);

  const handleCategoryClick = (cat: ReportCategory) => {
    setSelectedCategory(cat);
    setSelectedMonth(null);
  };

  const handleMonthClick = (monthIdx: number) => {
    setSelectedMonth(monthIdx);
    setOpen(false);
    setShowReport(true);
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setSelectedMonth(null);
  };

  const handleCloseReport = (val: boolean) => {
    if (!val) {
      setShowReport(false);
      setSelectedCategory(null);
      setSelectedMonth(null);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <FileText className="w-3.5 h-3.5" /> Ver Relatórios
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0 overflow-hidden">
          {!selectedCategory ? (
            // Category list
            <div>
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <p className="text-xs font-semibold text-foreground">Relatórios Disponíveis</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Seleccione o tipo de relatório</p>
              </div>
              <div className="p-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary group-hover:bg-primary/15 transition-colors">
                      {cat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{cat.label}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{cat.description}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Month list
            <div>
              <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
                <button onClick={handleBack} className="text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                </button>
                <div>
                  <p className="text-xs font-semibold text-foreground">{selectedCategory.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Seleccione o mês</p>
                </div>
              </div>
              <div className="p-1.5 max-h-[320px] overflow-y-auto">
                {MONTHS.map((month, idx) => {
                  const isFuture = idx > CURRENT_MONTH;
                  return (
                    <button
                      key={month}
                      onClick={() => !isFuture && handleMonthClick(idx)}
                      disabled={isFuture}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left group ${
                        isFuture ? "opacity-50 cursor-not-allowed" : "hover:bg-muted/50"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold ${
                        isFuture ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                      }`}>
                        {String(idx + 1).padStart(2, "0")}
                      </div>
                      <span className="text-xs font-medium text-foreground flex-1">{month}</span>
                      {isFuture ? (
                        <Badge variant="outline" className="text-[9px] gap-1 bg-muted/50 text-muted-foreground border-border">
                          <Loader2 className="w-2.5 h-2.5 animate-spin" /> Em Progresso
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] gap-1 bg-accent/10 text-accent border-accent/30">
                          <CalendarDays className="w-2.5 h-2.5" /> Disponível
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {showReport && selectedCategory && (
        <ReportsDialog
          open={showReport}
          onOpenChange={handleCloseReport}
          title={selectedCategory.label}
          reportPrefix={selectedCategory.prefix}
          type={selectedCategory.type}
          data={data}
        />
      )}
    </>
  );
}
