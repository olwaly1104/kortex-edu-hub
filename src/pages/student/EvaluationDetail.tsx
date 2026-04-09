import { useParams, Link, useSearchParams } from "react-router-dom";
import { grades, disciplines, lessons } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GraduationCap, Calendar, Clock, MapPin, BookOpen, FileText, Monitor, Upload, Download, Eye, CheckCircle2, Award, User } from "lucide-react";

export default function EvaluationDetail() {
  const { disciplineId } = useParams();
  const [searchParams] = useSearchParams();
  const evalIndex = Number(searchParams.get("index") || 0);

  const disc = disciplines.find(d => d.id === disciplineId);
  const gradeData = grades.find(g => g.disciplineId === disciplineId);
  const evaluation = gradeData?.evaluations[evalIndex];

  const discLessons = lessons.filter(l => l.disciplineId === disciplineId);
  const allMaterials = discLessons.flatMap(l => l.materials);

  if (!disc || !evaluation) return (
    <div className="p-8 text-muted-foreground">
      <Link to="/student/grades" className="text-primary hover:underline">← Voltar</Link>
      <p className="mt-4">Avaliação não encontrada.</p>
    </div>
  );

  const isPublished = evaluation.published && evaluation.grade !== null;

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-fade-in">
      <Link to={`/student/disciplines/${disciplineId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar a {disc.name}
      </Link>

      {/* Header card with gradient */}
      <Card className="p-5 bg-gradient-to-r from-primary/6 to-transparent border">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-primary/10">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-lg font-bold text-foreground leading-tight">{evaluation.name}</h1>
              {isPublished ? (
                <Badge variant="outline" className="text-[10px] gap-1 text-accent border-accent/20">
                  <CheckCircle2 className="w-3 h-3" /> Publicada
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] gap-1 text-secondary border-secondary/20">
                  <Clock className="w-3 h-3" /> Pendente
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] gap-1">
                <BookOpen className="w-3 h-3" /> {disc.name}
              </Badge>
              <Badge variant="outline" className="text-[10px] gap-1">
                <User className="w-3 h-3" /> {disc.professor}
              </Badge>
            </div>
          </div>
        </div>

        {/* KPI grid inside header */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border/50">
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Data</p>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {evaluation.date}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Modalidade</p>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              {evaluation.modality === "online" ? <Monitor className="w-3.5 h-3.5 text-muted-foreground" /> : <MapPin className="w-3.5 h-3.5 text-muted-foreground" />}
              {evaluation.modality === "online" ? "Online" : "Presencial"}
            </div>
            {evaluation.room && <p className="text-xs text-muted-foreground mt-0.5">{evaluation.room}</p>}
          </div>
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Nota</p>
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              <Award className="w-3.5 h-3.5 text-muted-foreground" />
              {isPublished ? (
                <span>
                  <span className={evaluation.grade! >= 10 ? "text-accent" : "text-destructive"}>{evaluation.grade}</span>
                  <span className="text-muted-foreground font-normal">/{evaluation.maxGrade} · {evaluation.weight}%</span>
                </span>
              ) : (
                <span className="text-muted-foreground font-normal">— · {evaluation.weight}%</span>
              )}
            </div>
          </div>
          {evaluation.duration && (
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Duração</p>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" /> {evaluation.duration}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Description + content + upload */}
      <Card className="p-5 space-y-5">
        <div>
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2 text-sm"><FileText className="w-4 h-4 text-primary" /> Descrição</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{evaluation.description}</p>
        </div>

        {allMaterials.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-primary" /> Conteúdo Relevante
            </h3>
            <div className="space-y-2">
              {allMaterials.slice(0, 4).map((mat, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <FileText className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{mat.name}</p>
                    <p className="text-xs text-muted-foreground">{mat.type.toUpperCase()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Eye className="w-4 h-4" /></button>
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Download className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {evaluation.modality === "online" && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm"><Upload className="w-4 h-4 text-primary" /> Upload</h3>
              {isPublished && (
                <div className="flex items-center gap-1.5 text-accent">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-medium">Entregue</span>
                </div>
              )}
            </div>
            {isPublished ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
                <FileText className="w-5 h-5 text-accent shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{evaluation.name.replace(/\s+/g, "_")}.pdf</p>
                  <p className="text-xs text-muted-foreground">Entregue em {evaluation.date}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Eye className="w-4 h-4" /></button>
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Download className="w-4 h-4" /></button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">Arraste o ficheiro ou clique para carregar</p>
                <Button className="gap-2"><Upload className="w-4 h-4" />Carregar ficheiro</Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
