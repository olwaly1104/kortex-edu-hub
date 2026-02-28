import { grades } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Monitor, MapPin, Clock, CheckCircle, TrendingUp, ClipboardList, FolderKanban, FileText, Presentation, BookOpen, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const getEvalIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("teste") || lower.includes("exame")) return ClipboardList;
  if (lower.includes("projec") || lower.includes("projet")) return FolderKanban;
  if (lower.includes("relatório") || lower.includes("relatorio")) return FileText;
  if (lower.includes("apresenta")) return Presentation;
  if (lower.includes("trabalho")) return BookOpen;
  return GraduationCap;
};

export default function StudentGrades() {
  const navigate = useNavigate();

  const allPublished = grades.flatMap(g => g.evaluations.filter(e => e.published && e.grade !== null));
  const overallAvg = allPublished.length > 0
    ? Math.round(allPublished.reduce((s, e) => s + (e.grade || 0), 0) / allPublished.length * 10) / 10
    : null;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Award className="w-6 h-6 text-secondary" /> Notas
        </h1>
      </div>

      {/* Média Geral Card */}
      {overallAvg !== null && (
        <Card className="p-5 flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${overallAvg >= 10 ? "bg-accent/10" : "bg-destructive/10"}`}>
            <TrendingUp className={`w-6 h-6 ${overallAvg >= 10 ? "text-accent" : "text-destructive"}`} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-medium">Média Geral</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={`text-3xl font-bold ${overallAvg >= 10 ? "text-accent" : "text-destructive"}`}>{overallAvg}</span>
              <span className="text-sm text-muted-foreground font-medium">/ 20</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{allPublished.length} avaliações publicadas</p>
          </div>
        </Card>
      )}

      <div className="space-y-6">
        {grades.map(g => {
          const published = g.evaluations.filter(e => e.published && e.grade !== null);
          const avg = published.length > 0 ? Math.round(published.reduce((s, e) => s + (e.grade || 0), 0) / published.length * 10) / 10 : null;
          return (
            <Card key={g.id} className="overflow-hidden">
              <div className="p-5 border-b bg-muted/30 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{g.disciplineName}</h3>
                  <p className="text-xs text-muted-foreground">{g.evaluations.length} avaliações</p>
                </div>
                {avg !== null && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Média parcial</p>
                    <p className={`text-xl font-bold ${avg >= 10 ? "text-accent" : "text-destructive"}`}>{avg}</p>
                  </div>
                )}
              </div>
              <div className="divide-y">
                {g.evaluations.map((ev, i) => {
                  const EvalIcon = getEvalIcon(ev.name);
                  return (
                  <div
                    key={i}
                    className="px-5 py-3.5 flex items-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => navigate(`/student/disciplines/${g.disciplineId}/evaluation?index=${i}`)}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      ev.published && ev.grade !== null
                        ? ev.grade >= 10 ? "bg-accent/10" : "bg-destructive/10"
                        : "bg-muted"
                    }`}>
                      {ev.published && ev.grade !== null ? (
                        <span className={`text-sm font-bold ${ev.grade >= 10 ? "text-accent" : "text-destructive"}`}>{ev.grade}</span>
                      ) : (
                        <EvalIcon className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{ev.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{ev.date}</span>
                        <span>•</span>
                        <span>Peso: {ev.weight}%</span>
                        <Badge variant="outline" className="text-[10px] gap-1">
                          {ev.modality === "online" ? <Monitor className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                          {ev.modality === "online" ? "Online" : "Presencial"}
                        </Badge>
                      </div>
                    </div>
                    {ev.published && ev.grade !== null ? (
                      <div className="flex items-center gap-1.5 text-accent shrink-0">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">{ev.grade}/{ev.maxGrade}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-medium">Pendente</span>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}