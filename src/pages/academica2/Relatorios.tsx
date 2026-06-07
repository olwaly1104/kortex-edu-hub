import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, FileText, Calendar, Users, BookOpen, ClipboardCheck } from "lucide-react";

const reports = [
  { icon: FileText, title: "Plano Curricular Completo", desc: "PDF consolidado por curso e ano com ementas." },
  { icon: Users, title: "Mapa de Alocação", desc: "Distribuição de estudantes por turma e curso." },
  { icon: Calendar, title: "Calendário Académico Anual", desc: "Marcos, semestres e épocas de exames." },
  { icon: ClipboardCheck, title: "Mapa de Exames", desc: "Cronograma de avaliações por época." },
  { icon: BookOpen, title: "Cadeiras & Docentes", desc: "Atribuição de docentes a cadeiras e turmas." },
  { icon: BarChart3, title: "Indicadores de Desempenho", desc: "KPIs académicos por curso e ano." },
];

export default function Relatorios() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="w-6 h-6 text-primary" /> Relatórios</h1>
        <p className="text-sm text-muted-foreground mt-1">Documentação institucional do ano letivo.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map(r => (
          <Card key={r.title} className="p-5">
            <r.icon className="w-8 h-8 p-1.5 bg-primary/10 text-primary rounded-lg mb-3" />
            <p className="text-sm font-semibold">{r.title}</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">{r.desc}</p>
            <Button variant="outline" size="sm" className="gap-2 w-full"><Download className="w-3 h-3" /> Descarregar PDF</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
