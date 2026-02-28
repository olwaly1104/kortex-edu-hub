import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { profDisciplines, profLessons, allTurmas } from "@/data/professorData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Eye, Users, Clock, FileText, Folder, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfessorLessons() {
  const navigate = useNavigate();
  const [selectedTurma, setSelectedTurma] = useState<string>("all");

  const filtered = selectedTurma === "all"
    ? profLessons
    : profLessons.filter(l => l.turmaId === selectedTurma);

  const published = filtered.filter(l => l.status === "publicada");
  const scheduled = filtered.filter(l => l.status === "agendada");
  const drafts = filtered.filter(l => l.status === "rascunho");

  const getDiscipline = (id: string) => profDisciplines.find(d => d.id === id);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Play className="w-6 h-6 text-primary" /> Minhas Aulas
        </h1>
      </div>

      {/* Turma filter carousel */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedTurma("all")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium shrink-0 transition-colors border",
            selectedTurma === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-foreground border-border hover:bg-muted"
          )}
        >
          <Folder className="w-4 h-4" />
          Todas ({profLessons.length})
        </button>
        {allTurmas.map(t => {
          const count = profLessons.filter(l => l.turmaId === t.id).length;
          if (count === 0) return null;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTurma(t.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium shrink-0 transition-colors border",
                selectedTurma === t.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:bg-muted"
              )}
            >
              <GraduationCap className="w-4 h-4" />
              {t.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Published lessons */}
      {published.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 rounded-full bg-accent" />
            <h2 className="text-sm font-bold text-foreground">Aulas Gravadas ({published.length})</h2>
          </div>
          <div className="space-y-2">
            {published.map(lesson => {
              const disc = getDiscipline(lesson.disciplineId);
              const turma = allTurmas.find(t => t.id === lesson.turmaId);
              return (
                <Card key={lesson.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/professor/disciplines/${lesson.disciplineId}`)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: (disc?.color || 'hsl(224,64%,33%)') + '15' }}>
                      <Play className="w-5 h-5" style={{ color: disc?.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">{lesson.title}</p>
                        <Badge variant="outline" className="text-[10px] shrink-0" style={{ color: disc?.color, borderColor: (disc?.color || '') + '40' }}>
                          Aula {lesson.number}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                        <span style={{ color: disc?.color }}>{disc?.code}</span>
                        <span>•</span>
                        <span>{turma?.name}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{lesson.duration}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{lesson.views} visualizações</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{lesson.attendance}/{lesson.totalStudents} presenças</span>
                        <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{lesson.materials.length} materiais</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground shrink-0">{lesson.date}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Scheduled */}
      {scheduled.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 rounded-full bg-secondary" />
            <h2 className="text-sm font-bold text-foreground">Agendadas ({scheduled.length})</h2>
          </div>
          <div className="space-y-2">
            {scheduled.map(lesson => {
              const disc = getDiscipline(lesson.disciplineId);
              const turma = allTurmas.find(t => t.id === lesson.turmaId);
              return (
                <Card key={lesson.id} className="p-4 opacity-80">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-secondary/10">
                      <Clock className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{lesson.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{disc?.name} · {turma?.name} · Publicação: {lesson.publishDate}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0 border-secondary/30 text-secondary">Agendada</Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Drafts */}
      {drafts.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 rounded-full bg-muted-foreground" />
            <h2 className="text-sm font-bold text-foreground">Rascunhos ({drafts.length})</h2>
          </div>
          <div className="space-y-2">
            {drafts.map(lesson => {
              const disc = getDiscipline(lesson.disciplineId);
              const turma = allTurmas.find(t => t.id === lesson.turmaId);
              return (
                <Card key={lesson.id} className="p-4 opacity-60">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-muted">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{lesson.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{disc?.name} · {turma?.name} · {lesson.date}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">Rascunho</Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">Sem aulas para esta turma.</p>
      )}
    </div>
  );
}
